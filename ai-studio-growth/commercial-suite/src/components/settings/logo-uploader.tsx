"use client";
import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";
import { removeLogoAction, uploadLogoAction } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";

export function LogoUploader({ companyId, slot, label, src, tile, disabled }: { companyId: string; slot: "primary" | "secondary"; label: string; src: string | null; tile: "light" | "dark"; disabled?: boolean }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const upload = (file: File) =>
    start(async () => {
      const fd = new FormData();
      fd.set("companyId", companyId);
      fd.set("slot", slot);
      fd.set("file", file);
      const res = await uploadLogoAction(fd);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      router.refresh();
    });
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="mb-3 text-[13px] font-medium">{label}</div>
      <div className={`flex h-24 items-center justify-center rounded-lg ${tile === "dark" ? "bg-navy-900" : "bg-canvas"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src ? <img src={src} alt={label} className="max-h-16 max-w-[80%] object-contain" /> : <span className="text-xs text-muted">No logo — typographic wordmark used</span>}
      </div>
      {!disabled && (
        <div className="mt-3 flex gap-2">
          <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <Button type="button" size="sm" variant="outline" loading={pending} onClick={() => ref.current?.click()}><Upload /> Upload</Button>
          {src && <Button type="button" size="sm" variant="ghost" onClick={() => start(async () => { const r = await removeLogoAction(companyId, slot); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); })}><Trash2 /> Remove</Button>}
        </div>
      )}
      <p className="mt-2 text-[11px] text-muted">PNG, JPEG or WebP up to 1 MB.</p>
    </div>
  );
}
