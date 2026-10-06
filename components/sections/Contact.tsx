"use client";

import { useState } from "react";
import { profile } from "@/data/profile";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { scrollToTarget } from "@/lib/scroll";

const { contact, social } = profile;

function InlineSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  // The visible text is a plain span sized to the current choice; a transparent
  // native <select> sits on top so keyboard, screen readers and mobile pickers just work.
  return (
    <span className="relative inline-block whitespace-nowrap border-b border-amber pr-[0.75em] text-amber focus-within:bg-amber/10">
      <span aria-hidden="true">{value}</span>
      <span aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[0.45em]">
        ▾
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        data-cursor="Change"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-ink text-base text-paper">
            {o}
          </option>
        ))}
      </select>
    </span>
  );
}

export function Contact() {
  const [topic, setTopic] = useState(contact.topics[0]);
  const [intent, setIntent] = useState(contact.intents[0]);
  const [line, setLine] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const message = `Hi Kishore — I'm working on ${topic} and I'd like to ${intent}.${line ? `\n\n${line}` : ""}${name ? `\n\n— ${name}` : ""}`;

  const channels = [
    social.email && { label: "Email", href: `mailto:${social.email}` },
    social.linkedin && { label: "LinkedIn", href: social.linkedin },
    social.github && { label: "GitHub", href: social.github },
    social.whatsapp && { label: "WhatsApp", href: `https://wa.me/${social.whatsapp}` },
  ].filter(Boolean) as { label: string; href: string }[];

  const start = async () => {
    if (social.email) {
      window.location.href = `mailto:${social.email}?subject=${encodeURIComponent(`Let's build: ${topic}`)}&body=${encodeURIComponent(message)}`;
      return;
    }
    if (social.whatsapp) {
      window.open(`https://wa.me/${social.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      setNote("Message copied. Send it through any channel below.");
    } catch {
      setNote("Copy the message above and send it through any channel below.");
    }
  };

  return (
    <section id="contact" data-section="Contact" aria-labelledby="contact-title" className="relative pb-24 pt-[24vh]">
      <div className="page-x">
        <Reveal className="flex items-center gap-3 text-mute">
          <span className="label">09</span>
          <span className="hairline w-10" aria-hidden="true" />
          <span className="label">Let&apos;s build</span>
        </Reveal>
        <h2 id="contact-title" className="display mt-6 text-[clamp(3rem,11.5vw,13rem)]">
          <Reveal as="span" lines>
            Have something
          </Reveal>
          <Reveal as="span" lines delay={0.08}>
            worth <span className="text-amber">building?</span>
          </Reveal>
        </h2>
        <Reveal className="mt-8 max-w-[38ch] text-xl text-mute" delay={0.1}>
          {contact.text}
        </Reveal>

        {/* Conversation composer */}
        <Reveal className="mt-16 border-t border-line pt-10" delay={0.1}>
          <p className="label text-dim">Start here — change the highlighted words</p>
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              start();
            }}
          >
            <p className="font-display text-[clamp(1.7rem,3.6vw,3.4rem)] font-medium leading-[1.25] tracking-[-0.03em]">
              Hi Kishore — I&apos;m working on{" "}
              <InlineSelect label="What you're working on" value={topic} options={contact.topics} onChange={setTopic} /> and I&apos;d like to{" "}
              <InlineSelect label="What you'd like" value={intent} options={contact.intents} onChange={setIntent} />.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
              <label className="block">
                <span className="label text-dim">In one line (optional)</span>
                <input
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                  placeholder="It's a…"
                  className="mt-2 w-full border-b border-line-2 bg-transparent py-3 text-lg text-paper outline-none transition-colors placeholder:text-dim focus:border-amber"
                />
              </label>
              <label className="block">
                <span className="label text-dim">Your name (optional)</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="mt-2 w-full border-b border-line-2 bg-transparent py-3 text-lg text-paper outline-none transition-colors focus:border-amber"
                />
              </label>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Magnetic>
                <button type="submit" className="btn btn-solid h-14 px-7" data-cursor="Send">
                  Start a conversation <span aria-hidden="true">→</span>
                </button>
              </Magnetic>
              <Magnetic>
                <button type="button" className="btn h-14 px-7" onClick={() => scrollToTarget("building")} data-cursor="View">
                  View my work
                </button>
              </Magnetic>
            </div>
            <p role="status" className="label mt-4 min-h-[1.4em] text-amber">
              {note}
            </p>
          </form>
        </Reveal>

        {channels.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-3 border-t border-line pt-6">
            {channels.map((c) => (
              <li key={c.label}>
                <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="label link-u text-mute hover:text-paper">
                  {c.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
