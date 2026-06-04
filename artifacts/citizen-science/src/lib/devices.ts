import { Watch, Activity, HeartPulse, CircleDot, Footprints, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Device {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

export const DEVICES: Device[] = [
  {
    id: "apple-watch",
    name: "Apple Watch",
    description: "Heart rate, activity, sleep & workouts",
    icon: Watch,
    accent: "bg-slate-900 text-white",
  },
  {
    id: "fitbit",
    name: "Fitbit",
    description: "Steps, resting heart rate & sleep stages",
    icon: Footprints,
    accent: "bg-teal-500 text-white",
  },
  {
    id: "whoop",
    name: "WHOOP",
    description: "Strain, recovery & heart-rate variability",
    icon: Activity,
    accent: "bg-black text-white",
  },
  {
    id: "oura",
    name: "Oura Ring",
    description: "Sleep, readiness & body temperature",
    icon: CircleDot,
    accent: "bg-indigo-500 text-white",
  },
  {
    id: "garmin",
    name: "Garmin",
    description: "GPS workouts, VO₂ max & stress tracking",
    icon: HeartPulse,
    accent: "bg-blue-700 text-white",
  },
  {
    id: "google-fit",
    name: "Google Fit",
    description: "Activity & health data from Android",
    icon: Smartphone,
    accent: "bg-emerald-500 text-white",
  },
];
