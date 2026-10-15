"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Plus, Trash2, X } from "lucide-react";
import { SECTION_META, SECTION_ORDER, defaultSection, type ProposalSectionData, type ProposalSectionType, type SectionContext, type SectionItem } from "@/lib/proposal/sections";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Proposal section editor. Sections can be added, removed, enabled/disabled, reordered
 * (drag-and-drop or move up/down) and edited. Field visibility follows SECTION_META.
 */
export function SectionsEditor({ sections, onChange, ctx }: { sections: ProposalSectionData[]; onChange: (s: ProposalSectionData[]) => void; ctx: SectionContext }) {
  const [selected, setSelected] = useState(0);
  const [adding, setAdding] = useState<ProposalSectionType | "">("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const current = sections[selected];

  const update = (i: number, patch: Partial<ProposalSectionData>) => onChange(sections.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const updateContent = (i: number, patch: Partial<ProposalSectionData["content"]>) => update(i, { content: { ...sections[i].content, ...patch } });
  const move = (from: number, to: number) => {
    if (to < 0 || to >= sections.length) return;
    const n = [...sections];
    const [x] = n.splice(from, 1);
    n.splice(to, 0, x);
    onChange(n);
    setSelected(to);
  };
  const remove = (i: number) => {
    onChange(sections.filter((_, j) => j !== i));
    setSelected(Math.max(0, i - 1));
  };
  const add = () => {
    if (!adding) return;
    const s = defaultSection(adding, ctx);
    // Insert before the closing page if there is one
    const closingIdx = sections.findIndex((x) => x.type === "CLOSING_PAGE");
    const at = adding === "COVER" ? 0 : adding === "CLOSING_PAGE" || closingIdx === -1 ? sections.length : closingIdx;
    const n = [...sections];
    n.splice(at, 0, s);
    onChange(n);
    setSelected(at);
    setAdding("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit">
        <CardHeader title="Sections" description="Drag to reorder, or use the arrows." />
        <ul className="divide-y divide-line">
          {sections.map((s, i) => (
            <li
              key={`${s.type}-${i}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== i) move(dragIndex, i);
                setDragIndex(null);
              }}
              className={cn("flex items-center gap-2 px-3 py-2.5", selected === i ? "bg-brand-50/70" : "hover:bg-canvas", !s.enabled && "opacity-60")}
            >
              <GripVertical className="size-4 shrink-0 cursor-grab text-slate-400" aria-hidden />
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setSelected(i)}>
                <span className="block truncate text-sm font-medium text-ink">{s.title || SECTION_META[s.type].label}</span>
                <span className="block text-xs text-muted">{SECTION_META[s.type].label}{!s.enabled && " · hidden"}</span>
              </button>
              <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move section up"><ArrowUp /></Button>
              <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => move(i, i + 1)} disabled={i === sections.length - 1} aria-label="Move section down"><ArrowDown /></Button>
            </li>
          ))}
          {sections.length === 0 && <li className="px-4 py-6 text-sm text-muted">No sections. Add one below.</li>}
        </ul>
        <div className="flex gap-2 border-t border-line p-3">
          <Select value={adding} onChange={(e) => setAdding(e.target.value as ProposalSectionType)} aria-label="Section type to add">
            <option value="">Add a section…</option>
            {SECTION_ORDER.map((t) => (
              <option key={t} value={t}>{SECTION_META[t].label}</option>
            ))}
          </Select>
          <Button type="button" variant="navy" onClick={add} disabled={!adding}><Plus /> Add</Button>
        </div>
      </Card>

      {current ? (
        <Card>
          <CardHeader
            title={SECTION_META[current.type].label}
            description={SECTION_META[current.type].description}
            actions={
              <>
                <Button type="button" variant="outline" size="sm" onClick={() => update(selected, { enabled: !current.enabled })}>
                  {current.enabled ? <><EyeOff /> Hide</> : <><Eye /> Show</>}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => remove(selected)}><Trash2 className="text-red-500" /> Remove</Button>
              </>
            }
          />
          <CardBody className="space-y-4">
            <SectionFields section={current} onTitle={(t) => update(selected, { title: t })} onContent={(p) => updateContent(selected, p)} />
          </CardBody>
        </Card>
      ) : (
        <Card className="p-8 text-sm text-muted">Select a section to edit it.</Card>
      )}
    </div>
  );
}

function SectionFields({ section, onTitle, onContent }: { section: ProposalSectionData; onTitle: (t: string) => void; onContent: (p: Partial<ProposalSectionData["content"]>) => void }) {
  const meta = SECTION_META[section.type];
  const c = section.content;
  const has = (f: string) => (meta.fields as readonly string[]).includes(f);
  const id = (k: string) => `sec-${k}`;
  return (
    <>
      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        {has("eyebrow") && (
          <Field label="Eyebrow label" htmlFor={id("eyebrow")} hint="Small caps label above the title">
            <Input id={id("eyebrow")} value={c.eyebrow ?? ""} onChange={(e) => onContent({ eyebrow: e.target.value })} />
          </Field>
        )}
        <Field label={section.type === "COVER" ? "Title (uses the document title)" : "Section title"} htmlFor={id("title")} className={has("eyebrow") ? "" : "md:col-span-2"}>
          <Input id={id("title")} value={section.title} onChange={(e) => onTitle(e.target.value)} disabled={section.type === "COVER"} />
        </Field>
      </div>
      {has("body") && (
        <Field label={section.type === "COVER" ? "Tagline" : "Body text"} htmlFor={id("body")} hint="Separate paragraphs with a blank line. Start lines with “- ” for bullet points.">
          <Textarea id={id("body")} rows={section.type === "COVER" ? 2 : 5} value={c.body ?? ""} onChange={(e) => onContent({ body: e.target.value })} />
        </Field>
      )}
      {has("highlight") && (
        <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
          {section.type !== "CLOSING_PAGE" && (
            <Field label="Highlight label" htmlFor={id("hl")} hint={section.type === "COVER" ? "e.g. Annual package price" : "e.g. Objective"}>
              <Input id={id("hl")} value={c.highlightLabel ?? ""} onChange={(e) => onContent({ highlightLabel: e.target.value })} />
            </Field>
          )}
          <Field
            label={section.type === "COVER" || section.type === "CLOSING_PAGE" ? "Price text override" : "Highlight text"}
            htmlFor={id("h")}
            hint={section.type === "COVER" || section.type === "CLOSING_PAGE" ? "Leave blank to show the calculated package price automatically" : undefined}
            className={section.type === "CLOSING_PAGE" ? "md:col-span-2" : ""}
          >
            <Textarea id={id("h")} rows={2} value={c.highlight ?? ""} onChange={(e) => onContent({ highlight: e.target.value })} />
          </Field>
        </div>
      )}
      {has("items") && (
        <>
          {section.type === "COMMERCIAL_TERMS" && (
            <Field label="Items heading" htmlFor={id("il")}>
              <Input id={id("il")} value={c.itemsLabel ?? ""} onChange={(e) => onContent({ itemsLabel: e.target.value })} />
            </Field>
          )}
          <ItemsEditor
            label={section.type === "CLOSING_PAGE" ? "Contact details" : `${meta.itemHint ?? "Item"}s`}
            items={c.items ?? []}
            onChange={(items) => onContent({ items })}
            tagHint={meta.tagHint}
            titleLabel={section.type === "CLOSING_PAGE" ? "Label" : "Title"}
            emptyHint={section.type === "EXECUTIVE_SUMMARY" ? "When empty, the package components are generated from the line items." : undefined}
          />
        </>
      )}
      {has("secondary") && (
        <>
          <Field label="Secondary list heading" htmlFor={id("sl")} hint="e.g. To be confirmed in the final commercial agreement">
            <Input id={id("sl")} value={c.secondaryLabel ?? ""} onChange={(e) => onContent({ secondaryLabel: e.target.value })} />
          </Field>
          <ItemsEditor label="Secondary list" items={c.secondaryItems ?? []} onChange={(secondaryItems) => onContent({ secondaryItems })} />
        </>
      )}
      {has("note") && (
        <Field label={section.type === "COVER" ? "Price note" : "Footnote"} htmlFor={id("note")}>
          <Input id={id("note")} value={c.note ?? ""} onChange={(e) => onContent({ note: e.target.value })} />
        </Field>
      )}
      {section.type === "SERVICE_OVERVIEW" && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-[13px] text-brand-800">
          One detail page is generated per line item. Configure each page under Services &amp; pricing → “Proposal presentation”.
        </p>
      )}
      {section.type === "PRICING_SUMMARY" && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-[13px] text-brand-800">The commercial table, tax breakdown and price panel are generated from the line items and totals.</p>
      )}
    </>
  );
}

function ItemsEditor({ label, items, onChange, tagHint, titleLabel = "Title", emptyHint }: { label: string; items: SectionItem[]; onChange: (i: SectionItem[]) => void; tagHint?: string; titleLabel?: string; emptyHint?: string }) {
  const set = (i: number, patch: Partial<SectionItem>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) => {
    const n = [...items];
    const [x] = n.splice(i, 1);
    n.splice(i + d, 0, x);
    onChange(n);
  };
  return (
    <div>
      <div className="mb-2 text-[13px] font-medium text-ink">{label}</div>
      {items.length === 0 && emptyHint && <p className="mb-2 text-xs text-muted">{emptyHint}</p>}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-line p-3">
            <div className="flex items-start gap-2">
              <div className="grid flex-1 gap-2 md:grid-cols-[1fr_160px]">
                <Input placeholder={titleLabel} value={it.title} onChange={(e) => set(i, { title: e.target.value })} aria-label={`${titleLabel} ${i + 1}`} />
                {tagHint !== undefined && tagHint !== "" ? (
                  <Input placeholder={tagHint || "Tag"} value={it.tag ?? ""} onChange={(e) => set(i, { tag: e.target.value })} aria-label={`Tag ${i + 1}`} />
                ) : (
                  <span className="hidden md:block" />
                )}
                <Textarea className="md:col-span-2" rows={2} placeholder="Detail" value={it.detail ?? ""} onChange={(e) => set(i, { detail: e.target.value })} aria-label={`Detail ${i + 1}`} />
              </div>
              <div className="flex flex-col">
                <Button type="button" variant="ghost" size="icon" className="size-7" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp /></Button>
                <Button type="button" variant="ghost" size="icon" className="size-7" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown /></Button>
                <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove"><X /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => onChange([...items, { title: "", detail: "" }])}><Plus /> Add</Button>
    </div>
  );
}
