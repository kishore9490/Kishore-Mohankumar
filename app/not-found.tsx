import { ButtonLink } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
    <Header />
    <main id="main">
    <section className="py-28 md:py-40">
      <div className="container-x text-center">
        <p className="code-chip inline-block rounded-md bg-ink px-2.5 py-1.5 text-cyan">404 · code not found</p>
        <h1 className="display mt-8 text-5xl md:text-7xl">This page isn’t in our index.</h1>
        <p className="mx-auto mt-5 max-w-md text-muted">The page may have moved. Let’s get you back on track.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/">Go home</ButtonLink>
          <ButtonLink href="/programs" variant="outline">Explore programs</ButtonLink>
        </div>
      </div>
    </section>
    </main>
    <Footer />
    </>
  );
}
