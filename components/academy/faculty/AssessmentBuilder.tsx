"use client";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { draftQuestionsWithAI, saveAssessment, type ActionResult, type QuestionInput } from "@/server/actions/faculty";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/academy/ui";
import { cn } from "@/lib/cn";
import { Field, FormResult, errProps, selectCls } from "./form";

type QType = "single" | "multiple" | "true_false" | "scenario" | "short" | "coding_case";
type Difficulty = "easy" | "medium" | "hard";

interface DraftQuestion {
  key: string;
  id?: string;
  type: QType;
  prompt: string;
  scenario: string;
  options: string[];
  correct: number[];
  accepted: string;
  points: number;
  explanation: string;
  difficulty: Difficulty;
  tags: string;
  aiDraft?: boolean;
}

export interface BuilderInitial {
  id?: string;
  title: string;
  courseId: string;
  kind: string;
  durationMin: number;
  opensAt: string;
  closesAt: string;
  maxAttempts: number;
  passMark: number;
  status: string;
  questions: QuestionInput[];
}

const TYPES: { key: QType; label: string; hint: string }[] = [
  { key: "single", label: "Multiple choice", hint: "One correct option" },
  { key: "multiple", label: "Multiple select", hint: "Several correct options" },
  { key: "true_false", label: "True / false", hint: "Two fixed options" },
  { key: "scenario", label: "Scenario-based", hint: "A short scenario, then options" },
  { key: "short", label: "Short answer", hint: "Typed answer, matched to accepted answers" },
  { key: "coding_case", label: "Coding case", hint: "A fictional record, pick the code" },
];
const KINDS = [
  { key: "quiz", label: "Quiz" },
  { key: "module", label: "Module test" },
  { key: "mock", label: "Mock test" },
  { key: "practice", label: "Practice" },
  { key: "final", label: "Final assessment" },
];

let seq = 0;
const k = () => `k${Date.now().toString(36)}${(seq++).toString(36)}`;

const blank = (type: QType = "single"): DraftQuestion => ({
  key: k(), type, prompt: "", scenario: "", options: type === "true_false" ? ["True", "False"] : type === "short" ? [] : ["", "", "", ""], correct: [], accepted: "", points: 2, explanation: "", difficulty: "medium", tags: "",
});

const fromInput = (q: QuestionInput, i: number): DraftQuestion => ({
  key: `init${i}`, id: q.id, type: q.type as QType, prompt: q.prompt, scenario: q.scenario ?? "", options: q.options, correct: q.correct, accepted: (q.acceptedAnswers ?? []).join("\n"),
  points: q.points, explanation: q.explanation, difficulty: q.difficulty as Difficulty, tags: q.tags.join(", "),
});

/** ISO → value for <input type="datetime-local">, always in India Standard Time so server and browser render the same. */
const toLocal = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() + 330 * 60000).toISOString().slice(0, 16);
};
/** datetime-local value (IST) → ISO. */
const fromLocal = (v: string) => (v ? new Date(`${v}:00+05:30`).toISOString() : "");

export function AssessmentBuilder({
  initial,
  courses,
  lessons,
  readOnly,
}: {
  initial: BuilderInitial;
  courses: { id: string; label: string }[];
  lessons: { id: string; title: string; courseId: string; module: string }[];
  readOnly: boolean;
}) {
  const router = useRouter();
  const uid = useId();
  const [meta, setMeta] = useState({
    title: initial.title, courseId: initial.courseId, kind: initial.kind, durationMin: String(initial.durationMin),
    opensAt: toLocal(initial.opensAt), closesAt: toLocal(initial.closesAt), maxAttempts: String(initial.maxAttempts), passMark: String(initial.passMark),
  });
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => initial.questions.map((q, i) => fromInput(q, i)));
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const [ai, setAi] = useState({ lessonId: "", focus: "", count: "3" });
  const [aiMsg, setAiMsg] = useState<string | null>(null);
  const [aiPending, startAi] = useTransition();

  const fe = result && !result.ok ? result.fieldErrors ?? {} : {};
  const total = questions.reduce((s, q) => s + (Number.isFinite(q.points) ? q.points : 0), 0);
  const courseLessons = lessons.filter((l) => l.courseId === meta.courseId);

  const update = (key: string, patch: Partial<DraftQuestion>) => setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  const move = (i: number, dir: -1 | 1) =>
    setQuestions((qs) => {
      const j = i + dir;
      if (j < 0 || j >= qs.length) return qs;
      const next = qs.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const changeType = (q: DraftQuestion, type: QType) =>
    update(q.key, {
      type,
      options: type === "true_false" ? ["True", "False"] : type === "short" ? [] : q.type === "true_false" || q.type === "short" ? ["", "", "", ""] : q.options,
      correct: type === "multiple" ? q.correct : q.correct.slice(0, 1),
    });

  const save = (submit: "draft" | "review") =>
    start(async () => {
      setResult(null);
      const res = await saveAssessment({
        id: initial.id,
        title: meta.title,
        courseId: meta.courseId,
        kind: meta.kind,
        durationMin: Number(meta.durationMin),
        maxAttempts: Number(meta.maxAttempts),
        passMark: Number(meta.passMark),
        opensAt: fromLocal(meta.opensAt),
        closesAt: fromLocal(meta.closesAt),
        submit,
        questions: questions.map((q) => ({
          id: q.id, type: q.type, prompt: q.prompt, scenario: q.scenario, options: q.options, correct: q.correct,
          acceptedAnswers: q.accepted.split(/\n|,/).map((s) => s.trim()).filter(Boolean), points: q.points, explanation: q.explanation,
          difficulty: q.difficulty, tags: q.tags.split(",").map((s) => s.trim()).filter(Boolean),
        })),
      });
      setResult(res);
      if (res.ok && !initial.id && res.id) router.push(`/academy/faculty/assessments/${res.id}?saved=1`);
      else if (res.ok) router.refresh();
    });

  const askAi = () =>
    startAi(async () => {
      setAiMsg(null);
      const res = await draftQuestionsWithAI({ lessonId: ai.lessonId, focus: ai.focus, count: Number(ai.count) });
      if (!res.ok) {
        setAiMsg(res.error);
        return;
      }
      // AI output is only ever inserted as editable drafts, clearly labelled.
      const blocks = res.draft.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).slice(0, 10);
      setQuestions((qs) => [...qs, ...blocks.map((b) => ({ ...blank("single"), prompt: b.slice(0, 1200), explanation: "", aiDraft: true }))]);
      setAiMsg(`${blocks.length} AI draft question${blocks.length === 1 ? "" : "s"} added at the end. Review, fix options and answers before use.`);
    });

  const metaField = (name: keyof typeof meta) => ({
    id: `${uid}-${name}`,
    value: meta[name],
    disabled: readOnly,
    onChange: (e: { target: { value: string } }) => setMeta((m) => ({ ...m, [name]: e.target.value })),
    ...errProps(`${uid}-${name}`, fe[name]),
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
      <div className="min-w-0 space-y-5">
        {/* Settings */}
        <section aria-labelledby={`${uid}-settings`} className="rounded-2xl border border-line bg-white p-5 md:p-6">
          <h2 id={`${uid}-settings`} className="text-[17px] font-semibold tracking-tight">Settings</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id={`${uid}-title`} label="Title" error={fe.title} className="sm:col-span-2">
              <input className="field" maxLength={140} placeholder="e.g. Respiratory chapter quiz" {...metaField("title")} />
            </Field>
            <Field id={`${uid}-courseId`} label="Course" error={fe.courseId}>
              <select className={selectCls} {...metaField("courseId")}>
                <option value="">Choose a course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field id={`${uid}-kind`} label="Type" error={fe.kind}>
              <select className={selectCls} {...metaField("kind")}>
                {KINDS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
              </select>
            </Field>
            <Field id={`${uid}-opensAt`} label="Opens (IST)" error={fe.opensAt}>
              <input type="datetime-local" className="field" {...metaField("opensAt")} />
            </Field>
            <Field id={`${uid}-closesAt`} label="Closes (IST)" error={fe.closesAt}>
              <input type="datetime-local" className="field" {...metaField("closesAt")} />
            </Field>
            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              <Field id={`${uid}-durationMin`} label="Minutes" error={fe.durationMin}>
                <input type="number" inputMode="numeric" min={5} max={300} className="field" {...metaField("durationMin")} />
              </Field>
              <Field id={`${uid}-maxAttempts`} label="Attempts" error={fe.maxAttempts}>
                <input type="number" inputMode="numeric" min={1} max={10} className="field" {...metaField("maxAttempts")} />
              </Field>
              <Field id={`${uid}-passMark`} label="Pass mark %" error={fe.passMark}>
                <input type="number" inputMode="numeric" min={0} max={100} className="field" {...metaField("passMark")} />
              </Field>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section aria-labelledby={`${uid}-questions`}>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="label !text-[10.5px]">{questions.length} question{questions.length === 1 ? "" : "s"} · {total} points</p>
              <h2 id={`${uid}-questions`} className="mt-1.5 text-[17px] font-semibold tracking-tight">Questions</h2>
            </div>
          </div>
          {fe.questions && <p className="mb-3 text-[13px] text-orange-800">{fe.questions}</p>}
          {questions.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft text-blue"><Icon name="file" size={22} /></span>
              <p className="mt-4 text-[16px] font-semibold">No questions yet</p>
              <p className="mt-1 max-w-sm text-[14px] text-muted">Add your first question below, or ask AI for draft questions to edit.</p>
            </div>
          ) : (
            <ol className="space-y-4">
              {questions.map((q, i) => {
                const err = fe[`q${i + 1}`];
                const qid = `${uid}-q${q.key}`;
                const usesOptions = q.type !== "short";
                const fixedOptions = q.type === "true_false";
                const multi = q.type === "multiple";
                return (
                  <li key={q.key} className={cn("rounded-2xl border bg-white", err ? "border-orange-300" : "border-line")}>
                    <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 md:px-5">
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-ink px-2 font-mono text-[12px] text-white">{i + 1}</span>
                      <span className="text-[13.5px] font-medium">{TYPES.find((t) => t.key === q.type)?.label}</span>
                      <span className="font-mono text-[12px] text-muted">· {q.points} pt{q.points === 1 ? "" : "s"}</span>
                      {q.aiDraft && <Pill tone="accent">AI draft — review before use</Pill>}
                      {!readOnly && (
                        <div className="ml-auto flex items-center gap-1">
                          <IconBtn label={`Move question ${i + 1} up`} icon="arrow" className="-rotate-90" disabled={i === 0} onClick={() => move(i, -1)} />
                          <IconBtn label={`Move question ${i + 1} down`} icon="arrow" className="rotate-90" disabled={i === questions.length - 1} onClick={() => move(i, 1)} />
                          <IconBtn label={`Remove question ${i + 1}`} icon="close" onClick={() => setQuestions((qs) => qs.filter((x) => x.key !== q.key))} />
                        </div>
                      )}
                    </div>
                    <fieldset disabled={readOnly} className="grid gap-4 p-4 md:p-5">
                      <legend className="sr-only">Question {i + 1}</legend>
                      {err && <p role="alert" className="text-[13px] text-orange-800">{err}</p>}
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field id={`${qid}-type`} label="Question type">
                          <select id={`${qid}-type`} className={selectCls} value={q.type} onChange={(e) => changeType(q, e.target.value as QType)}>
                            {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                          </select>
                        </Field>
                        <Field id={`${qid}-points`} label="Points">
                          <input id={`${qid}-points`} type="number" inputMode="numeric" min={1} max={50} className="field" value={Number.isFinite(q.points) ? q.points : ""} onChange={(e) => update(q.key, { points: e.target.value === "" ? Number.NaN : Number(e.target.value) })} />
                        </Field>
                        <Field id={`${qid}-diff`} label="Difficulty">
                          <select id={`${qid}-diff`} className={selectCls} value={q.difficulty} onChange={(e) => update(q.key, { difficulty: e.target.value as Difficulty })}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </Field>
                      </div>
                      {(q.type === "scenario" || q.type === "coding_case") && (
                        <Field id={`${qid}-scenario`} label={q.type === "coding_case" ? "Case note (fictional record)" : "Scenario"} hint="Use fictional details only — never real patient information.">
                          <textarea id={`${qid}-scenario`} rows={3} maxLength={3000} className="field resize-y" value={q.scenario} onChange={(e) => update(q.key, { scenario: e.target.value })} />
                        </Field>
                      )}
                      <Field id={`${qid}-prompt`} label="Question">
                        <textarea id={`${qid}-prompt`} rows={2} maxLength={1200} className="field resize-y" value={q.prompt} onChange={(e) => update(q.key, { prompt: e.target.value })} />
                      </Field>
                      {usesOptions ? (
                        <fieldset>
                          <legend className="mb-1.5 text-[13px] font-medium">Options <span className="font-normal text-muted">— {multi ? "tick every correct option" : "choose the correct option"}</span></legend>
                          <ul className="grid gap-2">
                            {q.options.map((o, oi) => {
                              const checked = q.correct.includes(oi);
                              return (
                                <li key={oi} className={cn("flex items-center gap-2 rounded-xl border px-3 py-1.5", checked ? "border-emerald-300 bg-emerald-50/60" : "border-line")}>
                                  <input
                                    type={multi ? "checkbox" : "radio"}
                                    name={`${qid}-correct`}
                                    checked={checked}
                                    onChange={() => update(q.key, { correct: multi ? (checked ? q.correct.filter((c) => c !== oi) : [...q.correct, oi]) : [oi] })}
                                    className="h-5 w-5 shrink-0 accent-[var(--color-blue)]"
                                    aria-label={`Mark option ${String.fromCharCode(65 + oi)} correct`}
                                  />
                                  <span className="w-5 shrink-0 font-mono text-[12px] text-muted">{String.fromCharCode(65 + oi)}</span>
                                  <input
                                    className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none"
                                    value={o}
                                    readOnly={fixedOptions}
                                    maxLength={300}
                                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                    aria-label={`Option ${String.fromCharCode(65 + oi)} text`}
                                    onChange={(e) => update(q.key, { options: q.options.map((x, xi) => (xi === oi ? e.target.value : x)) })}
                                  />
                                  {!readOnly && !fixedOptions && q.options.length > 2 && (
                                    <IconBtn
                                      label={`Remove option ${String.fromCharCode(65 + oi)}`}
                                      icon="close"
                                      onClick={() => update(q.key, { options: q.options.filter((_, xi) => xi !== oi), correct: q.correct.filter((c) => c !== oi).map((c) => (c > oi ? c - 1 : c)) })}
                                    />
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                          {!readOnly && !fixedOptions && q.options.length < 8 && (
                            <button type="button" onClick={() => update(q.key, { options: [...q.options, ""] })} className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-blue hover:bg-soft">
                              <Icon name="plus" size={14} /> Add option
                            </button>
                          )}
                        </fieldset>
                      ) : (
                        <Field id={`${qid}-accepted`} label="Accepted answers" hint="One per line. Matching ignores letter case.">
                          <textarea id={`${qid}-accepted`} rows={2} className="field resize-y" value={q.accepted} onChange={(e) => update(q.key, { accepted: e.target.value })} />
                        </Field>
                      )}
                      <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
                        <Field id={`${qid}-exp`} label="Explanation" hint="Shown to students after they answer.">
                          <textarea id={`${qid}-exp`} rows={2} maxLength={1500} className="field resize-y" value={q.explanation} onChange={(e) => update(q.key, { explanation: e.target.value })} />
                        </Field>
                        <Field id={`${qid}-tags`} label="Tags" hint="Comma-separated, e.g. conventions, respiratory">
                          <input id={`${qid}-tags`} className="field" value={q.tags} onChange={(e) => update(q.key, { tags: e.target.value })} />
                        </Field>
                      </div>
                    </fieldset>
                  </li>
                );
              })}
            </ol>
          )}
          {!readOnly && (
            <div className="mt-4 rounded-2xl border border-dashed border-line bg-white/70 p-4">
              <p className="label !text-[10px]">Add a question</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TYPES.map((t) => (
                  <button key={t.key} type="button" onClick={() => setQuestions((qs) => [...qs, blank(t.key)])} className="flex min-h-[52px] flex-col items-start rounded-xl border border-line bg-white px-3 py-2 text-left transition-colors hover:border-ink">
                    <span className="flex items-center gap-1.5 text-[13.5px] font-medium"><Icon name="plus" size={13} /> {t.label}</span>
                    <span className="text-[11.5px] text-muted">{t.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="label !text-[10.5px]">Total</p>
          <p className="mt-2 text-[34px] font-semibold leading-none tracking-tight tabular-nums">{total}<span className="ml-1.5 text-[14px] font-normal text-muted">points</span></p>
          <p className="mt-2 text-[13px] text-muted">{questions.length} question{questions.length === 1 ? "" : "s"} · pass at {meta.passMark || "—"}% ({Math.ceil((total * Number(meta.passMark || 0)) / 100)} pts)</p>
          {readOnly ? (
            <p className="mt-4 rounded-xl bg-mist px-3 py-3 text-[13px] text-muted">This assessment is {initial.status}. It’s locked — ask an admin to move it back to draft to make changes.</p>
          ) : (
            <div className="mt-5 grid gap-2">
              <Button type="button" onClick={() => save("review")} disabled={pending} iconLeft="upload">{pending ? "Saving…" : "Submit for review"}</Button>
              <Button type="button" variant="outline" onClick={() => save("draft")} disabled={pending}>Save draft</Button>
              <p className="text-[12px] text-muted">Publishing needs the course-publish permission (admin).</p>
            </div>
          )}
          {result && <div className="mt-4"><FormResult state={result} /></div>}
        </div>

        {!readOnly && (
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="flex items-center gap-2 text-[15px] font-semibold"><Icon name="sparkle" size={16} className="text-cyan-ink" /> AI draft questions</p>
            <p className="mt-1 text-[12.5px] text-muted">Drafts are added as editable questions labelled “AI draft — review before use”. Nothing is published automatically.</p>
            <div className="mt-4 grid gap-3">
              <Field id={`${uid}-ai-lesson`} label="Lesson">
                <select id={`${uid}-ai-lesson`} className={selectCls} value={ai.lessonId} onChange={(e) => setAi((a) => ({ ...a, lessonId: e.target.value }))}>
                  <option value="">{meta.courseId ? "Choose a lesson" : "Choose a course first"}</option>
                  {courseLessons.map((l) => <option key={l.id} value={l.id}>{l.module} — {l.title}</option>)}
                </select>
              </Field>
              <Field id={`${uid}-ai-focus`} label="Focus (optional)">
                <input id={`${uid}-ai-focus`} className="field" maxLength={300} value={ai.focus} onChange={(e) => setAi((a) => ({ ...a, focus: e.target.value }))} placeholder="e.g. excludes notes" />
              </Field>
              <Field id={`${uid}-ai-count`} label="How many">
                <select id={`${uid}-ai-count`} className={selectCls} value={ai.count} onChange={(e) => setAi((a) => ({ ...a, count: e.target.value }))}>
                  {[3, 5, 8].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Button type="button" variant="outline" iconLeft="sparkle" onClick={askAi} disabled={aiPending || !ai.lessonId}>{aiPending ? "Drafting…" : "Draft with AI"}</Button>
              {aiMsg && <p role="status" className="rounded-xl bg-soft px-3 py-2.5 text-[13px]">{aiMsg}</p>}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function IconBtn({ label, icon, onClick, disabled, className }: { label: string; icon: "arrow" | "close"; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-mist hover:text-ink disabled:opacity-30">
      <Icon name={icon} size={15} className={className} />
    </button>
  );
}
