export const applicationStatuses = [
  "interested",
  "planned",
  "applied",
  "screening",
  "assignment_or_test",
  "interview_scheduling",
  "first_interview",
  "second_interview",
  "final_interview",
  "offer_negotiation",
  "accepted",
  "rejected",
  "on_hold",
  "withdrawn"
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export const applicationChannels = [
  "wanted",
  "saramin",
  "jobkorea",
  "linkedin",
  "company_site",
  "headhunter",
  "referral",
  "remember",
  "rocketpunch",
  "other"
] as const;

export type ApplicationChannel = (typeof applicationChannels)[number];

export const inboxSources = [
  "gmail",
  "email_manual",
  "kakao_paste",
  "sms_paste",
  "dm_paste",
  "manual"
] as const;

export type InboxSource = (typeof inboxSources)[number];

export const inboxStatuses = ["pending", "linked", "ignored", "needs_review"] as const;
export type InboxStatus = (typeof inboxStatuses)[number];

export const eventTypes = [
  "application_submitted",
  "screening_started",
  "screening_passed",
  "interview_invited",
  "interview_scheduled",
  "assignment_sent",
  "coding_test_sent",
  "offer_negotiation",
  "final_accepted",
  "rejected",
  "follow_up",
  "note",
  "other"
] as const;

export type EventType = (typeof eventTypes)[number];

export const todoStatuses = ["open", "done", "dismissed"] as const;
export type TodoStatus = (typeof todoStatuses)[number];

export type Application = {
  id: string;
  user_id: string;
  company: string;
  role: string;
  channel: ApplicationChannel;
  status: ApplicationStatus;
  applied_at: string | null;
  deadline_at: string | null;
  last_contact_at: string | null;
  job_post_url: string | null;
  job_post_snapshot: string | null;
  resume_version: string | null;
  portfolio_version: string | null;
  priority: number;
  next_action: string | null;
  next_action_due_at: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type InboxItem = {
  id: string;
  user_id: string;
  source: InboxSource;
  status: InboxStatus;
  received_at: string;
  title: string | null;
  sender: string | null;
  raw_text: string | null;
  provider: string | null;
  provider_message_id: string | null;
  provider_thread_id: string | null;
  provider_url: string | null;
  extracted_company: string | null;
  extracted_role: string | null;
  extracted_event_type: EventType | null;
  extracted_event_at: string | null;
  extracted_deadline_at: string | null;
  extracted_action_required: string | null;
  suggested_status: ApplicationStatus | null;
  summary: string | null;
  confidence: number;
  parsed_json: Record<string, unknown> | null;
  linked_application_id: string | null;
  linked_event_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationEvent = {
  id: string;
  user_id: string;
  application_id: string;
  inbox_item_id: string | null;
  event_type: EventType;
  title: string;
  body: string | null;
  occurred_at: string;
  source: InboxSource;
  raw_text: string | null;
  created_at: string;
  updated_at: string;
};

export type Todo = {
  id: string;
  user_id: string;
  application_id: string | null;
  inbox_item_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  status: TodoStatus;
  created_at: string;
  updated_at: string;
};

export type QAEntry = {
  id: string;
  user_id: string;
  application_id: string;
  question: string;
  answer: string;
  submitted_at: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentRecord = {
  id: string;
  user_id: string;
  application_id: string | null;
  kind: string;
  name: string;
  version: string | null;
  storage_path: string | null;
  external_url: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type LinkInboxRequest = {
  inboxItemId: string;
  applicationId: string;
  createEvent: boolean;
  updateApplicationStatus: boolean;
  createTodo: boolean;
  eventType?: EventType;
  eventTitle?: string;
  eventBody?: string;
  occurredAt?: string;
  newStatus?: ApplicationStatus;
  todoTitle?: string;
  todoDueAt?: string;
};
