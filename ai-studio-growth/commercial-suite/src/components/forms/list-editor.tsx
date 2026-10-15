"use client";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Editable list of short strings (inclusions, exclusions, benefits). */
export function StringListEditor({ value, onChange, placeholder, addLabel = "Add item" }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string }) {
  const set = (i: number, v: string) => onChange(value.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const n = [...value];
    const [x] = n.splice(i, 1);
    n.splice(i + d, 0, x);
    onChange(n);
  };
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Input value={v} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} aria-label={`${placeholder ?? "Item"} ${i + 1}`} />
          <Button type="button" variant="ghost" size="icon" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp /></Button>
          <Button type="button" variant="ghost" size="icon" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown /></Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove"><X /></Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...value, ""])}><Plus /> {addLabel}</Button>
    </div>
  );
}
