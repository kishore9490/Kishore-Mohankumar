import Image from "next/image";
import { visibleFaculty } from "@/data/faculty";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Faculty } from "@/lib/types";

export function FacultyGrid({ ids }: { ids?: string[] }) {
  const list = ids?.length ? visibleFaculty.filter((f) => ids.includes(f.id)) : visibleFaculty;

  if (!list.length) {
    return (
      <div className="grid gap-6 rounded-2xl border border-dashed border-line bg-white p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <p className="text-[20px] font-semibold tracking-tight">Faculty profiles are being published.</p>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
            We only publish verified faculty experience. Meet the people who teach at EMC in a free demo class — and ask them anything.
          </p>
        </div>
        <ButtonLink href="/demo">Meet them in a demo</ButtonLink>
      </div>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((f) => (
        <FacultyCard key={f.id} f={f} />
      ))}
    </ul>
  );
}

function FacultyCard({ f }: { f: Faculty }) {
  return (
    <li className="group relative overflow-hidden rounded-2xl border border-line bg-white">
      {f.status === "placeholder" && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-orange-100 px-2 py-0.5 text-[10.5px] font-medium text-orange-800">
          Placeholder · dev only
        </span>
      )}
      <div className="relative aspect-[4/3] bg-mist">
        {f.photo ? (
          <Image src={f.photo} alt={f.name} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted/50">
            <Icon name="user" size={48} />
          </div>
        )}
      </div>
      <div className="p-6">
        <p className="text-[19px] font-semibold tracking-tight">{f.name}</p>
        <p className="mt-0.5 text-[14px] text-muted">{f.designation}</p>
        {f.experience && <p className="label mt-4">{f.experience}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {f.specialization.map((s) => (
            <span key={s} className="rounded-md bg-mist px-2 py-1 text-[12px]">{s}</span>
          ))}
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-muted">{f.bio}</p>
        {f.linkedin && (
          <a href={f.linkedin} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue">
            <Icon name="linkedin" size={14} /> LinkedIn
          </a>
        )}
      </div>
    </li>
  );
}
