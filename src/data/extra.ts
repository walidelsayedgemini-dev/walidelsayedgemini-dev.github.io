import type { Bi } from "../i18n";

/**
 * Personal details that are NOT on GitHub. Nothing here is invented — every list starts empty.
 * Fill any of them in and the matching section (and nav link) appears automatically.
 */
export interface Entry {
  title: Bi; // degree / job title
  place: Bi; // university / employer
  period: Bi; // e.g. { en: "2018 – 2022", ar: "٢٠١٨ – ٢٠٢٢" }
  note?: Bi;
}
export interface Quote {
  text: Bi;
  name: Bi;
  role?: Bi;
}

export const extra: {
  /** Public URL or path of a CV file, e.g. "cv/walid-sayed.pdf" placed in /public. Empty = no button. */
  cvUrl: string;
  education: Entry[];
  experience: Entry[];
  testimonials: Quote[];
} = {
  cvUrl: "",
  education: [],
  experience: [],
  testimonials: [],
};

export const hasJourney = extra.education.length + extra.experience.length + extra.testimonials.length > 0;
