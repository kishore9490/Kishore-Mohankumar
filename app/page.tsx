import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Journey } from "@/components/sections/Journey";
import { Building } from "@/components/sections/Building";
import { StackUniverse } from "@/components/sections/StackUniverse";
import { Systems } from "@/components/sections/Systems";
import { Now } from "@/components/sections/Now";
import { Lab } from "@/components/sections/Lab";
import { Beyond } from "@/components/sections/Beyond";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { Nav } from "@/components/ui/Nav";
import { Cursor } from "@/components/ui/Cursor";
import { Console } from "@/components/ui/Console";
import { SmoothScroll } from "@/components/ui/SmoothScroll";

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <div className="guides" aria-hidden="true" />
      <Nav />
      <main id="main" className="relative z-[2] overflow-x-clip">
        <Hero />
        <About />
        <Journey />
        <Building />
        <StackUniverse />
        <Systems />
        <Now />
        <Lab />
        <Beyond />
        <Contact />
      </main>
      <Footer />
      <Console />
      <Cursor />
    </>
  );
}
