import type {
  Application,
  ApplicationEvent,
  DocumentRecord,
  InboxItem,
  QAEntry,
  Todo
} from "./domain";

type EmailAccount = {
  id: string;
  user_id: string;
  provider: string;
  email: string | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  last_synced_at: string | null;
  sync_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type EmailSyncLog = {
  id: string;
  user_id: string;
  email_account_id: string | null;
  started_at: string;
  finished_at: string | null;
  status: string;
  fetched_count: number;
  created_inbox_count: number;
  error_message: string | null;
};

type Row<T> = T;
type Insert<T> = Partial<Omit<T, "id" | "created_at" | "updated_at">> & {
  id?: string;
};
type Update<T> = Partial<Omit<T, "id" | "created_at">>;

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: Row<Application>;
        Insert: Insert<Application>;
        Update: Update<Application>;
      };
      inbox_items: {
        Row: Row<InboxItem>;
        Insert: Insert<InboxItem>;
        Update: Update<InboxItem>;
      };
      application_events: {
        Row: Row<ApplicationEvent>;
        Insert: Insert<ApplicationEvent>;
        Update: Update<ApplicationEvent>;
      };
      todos: {
        Row: Row<Todo>;
        Insert: Insert<Todo>;
        Update: Update<Todo>;
      };
      qa_entries: {
        Row: Row<QAEntry>;
        Insert: Insert<QAEntry>;
        Update: Update<QAEntry>;
      };
      documents: {
        Row: Row<DocumentRecord>;
        Insert: Insert<DocumentRecord>;
        Update: Update<DocumentRecord>;
      };
      email_accounts: {
        Row: Row<EmailAccount>;
        Insert: Insert<EmailAccount>;
        Update: Update<EmailAccount>;
      };
      email_sync_logs: {
        Row: Row<EmailSyncLog>;
        Insert: Insert<EmailSyncLog>;
        Update: Update<EmailSyncLog>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      application_status:
        | "interested"
        | "planned"
        | "applied"
        | "screening"
        | "assignment_or_test"
        | "interview_scheduling"
        | "first_interview"
        | "second_interview"
        | "final_interview"
        | "offer_negotiation"
        | "accepted"
        | "rejected"
        | "on_hold"
        | "withdrawn";
      application_channel:
        | "wanted"
        | "saramin"
        | "jobkorea"
        | "linkedin"
        | "company_site"
        | "headhunter"
        | "referral"
        | "remember"
        | "rocketpunch"
        | "other";
      inbox_source: "gmail" | "email_manual" | "kakao_paste" | "sms_paste" | "dm_paste" | "manual";
      inbox_status: "pending" | "linked" | "ignored" | "needs_review";
      event_type:
        | "application_submitted"
        | "screening_started"
        | "screening_passed"
        | "interview_invited"
        | "interview_scheduled"
        | "assignment_sent"
        | "coding_test_sent"
        | "offer_negotiation"
        | "final_accepted"
        | "rejected"
        | "follow_up"
        | "note"
        | "other";
      todo_status: "open" | "done" | "dismissed";
    };
    CompositeTypes: Record<string, never>;
  };
};
