import type { ApplicationStatus, EventType, InboxSource } from "@/types/domain";

export type ParseInput = {
  source: InboxSource;
  title?: string;
  sender?: string;
  rawText: string;
  receivedAt?: string;
  timezone?: string;
};

export type ParsedInboxItem = {
  extractedCompany: string | null;
  extractedRole: string | null;
  eventType: EventType;
  suggestedStatus: ApplicationStatus | null;
  eventAt: string | null;
  deadlineAt: string | null;
  actionRequired: string | null;
  summary: string;
  confidence: number;
  importantPhrases: string[];
};
