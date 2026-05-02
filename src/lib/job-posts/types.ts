import type { ApplicationChannel } from "@/types/domain";

export const jobPostProviders = ["wanted"] as const;
export type JobPostProvider = (typeof jobPostProviders)[number];

export type JobPostPreview = {
  provider: JobPostProvider;
  providerId: string;
  url: string;
  company: string;
  role: string;
  channel: ApplicationChannel;
  deadlineAt: string | null;
  snapshot: string;
  summary: string;
};

export type JobPostProviderAdapter = {
  provider: JobPostProvider;
  supports: (url: URL) => boolean;
  preview: (url: URL) => Promise<JobPostPreview>;
};
