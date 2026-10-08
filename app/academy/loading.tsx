import { Skeleton } from "@/components/academy/ui";

/** Dashboard skeleton shown while a page's data loads. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-4 h-10 w-80 max-w-full" />
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    </div>
  );
}
