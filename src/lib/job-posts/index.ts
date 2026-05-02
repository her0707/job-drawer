import { wantedJobPostProvider } from "./providers/wanted";
import type { JobPostProvider, JobPostProviderAdapter } from "./types";

export type { JobPostPreview, JobPostProvider } from "./types";
export { jobPostProviders } from "./types";
export { JobPostPreviewError } from "./providers/wanted";

const adapters: Record<JobPostProvider, JobPostProviderAdapter> = {
  wanted: wantedJobPostProvider
};

export function getJobPostProvider(provider: JobPostProvider) {
  return adapters[provider] ?? null;
}

export function parseJobPostUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}
