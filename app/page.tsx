import { Hero } from "@/components/hero/Hero";
import { IntentSelector } from "@/components/home/IntentSelector";
import { FeaturedStory } from "@/components/home/FeaturedStory";
import { TestRideBand } from "@/components/home/TestRideBand";
import { HomeFinance } from "@/components/home/HomeFinance";
import { FindYourRide } from "@/components/bikes/FindYourRide";
import { HelpMeChoose } from "@/components/bikes/HelpMeChoose";
import { ServiceShowcase } from "@/components/service/ServiceShowcase";
import { AccessoriesTeaser } from "@/components/accessories/AccessoryConfigurator";
import { OffersSection } from "@/components/dealership/OffersSection";
import { TrustSection } from "@/components/dealership/TrustSection";
import { RiderStories } from "@/components/dealership/RiderStories";
import { DealershipSection } from "@/components/dealership/DealershipSection";

/**
 * Rhythm: cinematic hero → intent → discovery → product story → guided choice
 * → test ride → finance → service → accessories → offers → trust → showroom.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <IntentSelector />
      <FindYourRide compact index="01" />
      <FeaturedStory />
      <HelpMeChoose index="02" />
      <TestRideBand />
      <HomeFinance index="03" />
      <ServiceShowcase index="04" />
      <AccessoriesTeaser index="05" />
      <OffersSection index="06" />
      <TrustSection index="06" />
      <RiderStories index="07" tone="paper" />
      <DealershipSection index="08" />
    </>
  );
}
