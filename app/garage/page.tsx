import type { Metadata } from "next";
import { GarageLoader } from "@/components/service/Garage";
import { dealership } from "@/data/dealership";

export const metadata: Metadata = {
  title: "My Honda garage",
  description: `Your Honda at ${dealership.name} — service history, next service due, warranty and insurance reminders, and upcoming bookings.`,
  alternates: { canonical: "/garage" },
  robots: { index: false, follow: true },
};

export default function GaragePage() {
  return <GarageLoader />;
}
