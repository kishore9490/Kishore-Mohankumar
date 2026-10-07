import { Icon, type IconName } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";

export function EmptyPanel({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center md:p-16">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-soft text-blue"><Icon name={icon} size={24} /></span>
      <p className="mt-6 text-[20px] font-semibold tracking-tight">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">{text}</p>
      <ButtonLink href="/programs" variant="outline" className="mt-8">Explore programs</ButtonLink>
    </div>
  );
}
