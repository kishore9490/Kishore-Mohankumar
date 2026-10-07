import { Hero } from "@/components/hero/Hero";
import { IntentSelector } from "@/components/home/IntentSelector";
import { FeaturedStory } from "@/components/home/FeaturedStory";
import { TestRideBand } from "@/components/home/TestRideBand";

export default function Home() {
  return (
    <>
      <Hero />
      <IntentSelector />
      <FeaturedStory />
      <TestRideBand />
    </>
  );
}
