import { profile } from "@/data/profile";

export function Footer() {
  const { social } = profile;
  const links = [
    social.email && { label: "Email", href: `mailto:${social.email}` },
    social.linkedin && { label: "LinkedIn", href: social.linkedin },
    social.github && { label: "GitHub", href: social.github },
    social.whatsapp && { label: "WhatsApp", href: `https://wa.me/${social.whatsapp}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="relative border-t border-line page-x pb-28 pt-12 lg:pb-10" data-section="Footer">
      <div className="grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="display text-[clamp(2.2rem,6vw,6rem)]">
            {profile.name.first} {profile.name.last}
          </p>
          <p className="label mt-4 text-mute">{profile.roles.join(" · ")}</p>
        </div>
        <div className="md:col-span-5 md:text-right">
          <p className="font-display text-3xl font-semibold tracking-[-0.03em]">
            Still building<span className="text-amber">.</span>
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="label link-u text-mute hover:text-paper">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <p className="label text-dim">© {new Date().getFullYear()} {profile.name.first} {profile.name.last}</p>
        <p className="label hidden text-dim md:block">
          Press <kbd className="border border-line-2 px-1.5 py-0.5 text-mute">`</kbd> to open the console
        </p>
        <a href="#top" className="label link-u text-mute hover:text-paper">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
