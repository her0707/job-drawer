# 지원로그 MVP SPEC

문서 버전: v0.1  
작성일: 2026-04-28  
기본 타임존: Asia/Seoul  
프로젝트명: 지원로그 / Application Tracker

## 1. 제품 정의

지원로그는 여러 채용 채널에 흩어진 지원 이력, 전형 안내, 메일/카카오톡/문자 메시지, 면접 일정, 지원서 질문과 답변을 한곳에 모아 관리하는 개인용 채용 지원 관리 웹앱이다.

MVP 목표는 거창한 SaaS가 아니라, 사용자가 본인의 구직 활동을 모바일과 데스크톱에서 실제로 관리할 수 있는 웹앱을 만드는 것이다.

## 2. 핵심 원칙

1. 이메일은 주된 자동 수집 수단이다. MVP에서는 수신함 후보 생성까지만 자동화하고 상태 변경은 사용자가 확인한다.
2. 카카오톡, 문자, DM 등은 자동 연동하지 않는다. 사용자가 텍스트를 복사해 붙여넣으면 파싱하여 수신함 후보로 만든다.
3. 모든 외부 입력은 먼저 Inbox에 들어간다. 사용자가 특정 지원 건에 연결해야 Timeline/Event가 된다.
4. 사용자 확인 없는 상태 변경은 금지한다.
5. 자동화보다 누락 방지가 중요하다.
6. 모바일과 데스크톱 모두 사용 가능한 반응형 웹앱으로 만든다.
7. 초기에는 결제, 팀 기능, 복잡한 AI 코칭, 카카오톡 직접 연동을 구현하지 않는다.

## 3. 비목표

MVP에서 제외한다.

- 결제/구독 기능
- 팀/공유 기능
- 채용공고 추천
- 기업 리뷰/연봉 데이터 제공
- 카카오톡 자동 수집
- LinkedIn/리멤버 DM 자동 수집
- 모든 채용 플랫폼 API 연동
- AI 면접 코칭 풀패키지
- 이력서 자동 생성
- 크롬 확장 프로그램
- 복잡한 통계 대시보드

## 4. 추천 기술 스택

- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- UI: shadcn/ui 또는 자체 컴포넌트
- Database: Supabase Postgres
- Auth: Supabase Auth
- Security: Supabase RLS
- Storage: Supabase Storage 또는 파일 메타데이터 우선 저장
- Deployment: Vercel + Supabase
- Date handling: date-fns 또는 dayjs

초기 구현은 Gmail 없이 Core CRUD와 Inbox paste flow를 먼저 만들고, 이후 Gmail OAuth/Sync를 붙인다. AI 파서는 인터페이스만 열어두고 초기에는 규칙 기반 파서를 구현한다.

## 5. 핵심 정보 구조

```text
User
 ├─ Applications
 │   ├─ Events / Timeline
 │   ├─ Todos
 │   ├─ Q&A Entries
 │   └─ Documents
 ├─ Inbox Items
 └─ Email Accounts / Sync Logs
```

| 개체 | 설명 |
| --- | --- |
| Application | 회사 + 포지션 단위의 지원 건 |
| Inbox Item | 이메일/카톡 복붙/문자/수동 입력으로 들어온 미확정 후보 |
| Event | 지원 건에 연결된 확정 전형 이벤트 |
| Todo | 회신, 면접 준비, 과제 제출 등 해야 할 일 |
| Q&A Entry | 지원서 질문과 제출 답변 |
| Document | 이력서/포트폴리오/과제 파일 또는 파일명 메타데이터 |

## 6. 사용자 시나리오

### 지원 건 생성

1. 사용자가 `새 지원 건`을 누른다.
2. 회사명, 포지션, 채널, 지원일, 공고 URL, 상태를 입력한다.
3. 지원 건이 목록과 대시보드에 표시된다.

### Gmail 후보 수집

1. 사용자가 Gmail 연동을 켠다.
2. 시스템이 최근 90일 메일 중 채용 관련 가능성이 높은 메일을 검색한다.
3. 제목, 발신자, 수신일, snippet/body 일부를 파싱한다.
4. 채용 관련으로 판단되면 Inbox 후보로 만든다.
5. 사용자가 Inbox에서 후보를 확인한다.
6. 관련 지원 건에 연결하면 Event가 생성되고 상태 변경/할 일이 추천된다.

### 카카오톡/문자/DM 복붙

1. 사용자가 외부 메시지를 복사한다.
2. `/inbox/new` 화면에 붙여넣는다.
3. 시스템이 회사, 포지션, 이벤트 유형, 일정, 해야 할 일을 추출한다.
4. Inbox 후보로 저장한다.
5. 사용자는 기존 지원 건에 연결하거나 새 지원 건을 만든다.

### 면접 전 확인

1. 모바일에서 특정 지원 건 상세를 연다.
2. 공고 URL, 지원일, 제출한 이력서 버전, 질문/답변, 타임라인을 확인한다.
3. Todo에서 면접 준비 항목을 확인한다.

## 7. 라우트

### 페이지 라우트

| Route | 설명 |
| --- | --- |
| `/` | 로그인 전 랜딩 또는 로그인 후 `/dashboard` 리다이렉트 |
| `/dashboard` | 요약 대시보드 |
| `/applications` | 지원 건 목록 |
| `/applications/new` | 새 지원 건 생성 |
| `/applications/[id]` | 지원 건 상세 |
| `/applications/[id]/edit` | 지원 건 수정 |
| `/inbox` | 수신함 후보 목록 |
| `/inbox/new` | 카톡/문자/DM 복붙 입력 |
| `/todos` | 전체 할 일 목록 |
| `/settings` | 설정 |
| `/settings/integrations` | Gmail 연동 설정 |
| `/settings/export` | 데이터 내보내기 |

### API 라우트

| Route | Method | 설명 |
| --- | --- | --- |
| `/api/inbox/parse` | POST | 원문 텍스트를 파싱하여 후보 JSON 생성 |
| `/api/inbox/[id]/link` | POST | Inbox item을 Application에 연결하고 Event 생성 |
| `/api/inbox/[id]/ignore` | POST | Inbox item 무시 처리 |
| `/api/gmail/connect` | GET | Gmail OAuth 시작 |
| `/api/gmail/callback` | GET | OAuth callback 처리 |
| `/api/gmail/sync` | POST | Gmail 채용 메일 동기화 |
| `/api/export` | GET | 사용자 데이터 export |

## 8. 반응형 UI 요구사항

데스크톱은 좌측 사이드바와 메인 영역을 기본으로 한다. 사이드바에는 Dashboard, Applications, Inbox, Todos, Settings를 둔다.

모바일은 하단 탭바를 기본으로 한다. 탭은 홈, 지원, 수신함, 할 일, 설정이다. 목록은 카드 중심 UI로 구성하고, 상세 페이지는 섹션 접기/펼치기를 지원한다.

지원 상세 상단에는 다음 정보를 바로 보여준다.

- 회사 / 포지션
- 현재 상태
- 면접/과제/회신 등 다음 액션
- 지원일
- 마지막 연락일
- 제출 이력서 버전
- 최근 이벤트 3개

## 9. 데이터베이스 스키마

Supabase Postgres migration으로 작성한다. 모든 사용자 데이터 테이블에는 `user_id`를 두고 `auth.uid() = user_id` 기준 RLS를 적용한다.

### Enums

```sql
create type application_status as enum (
  'interested',
  'planned',
  'applied',
  'screening',
  'assignment_or_test',
  'interview_scheduling',
  'first_interview',
  'second_interview',
  'final_interview',
  'offer_negotiation',
  'accepted',
  'rejected',
  'on_hold',
  'withdrawn'
);

create type application_channel as enum (
  'wanted',
  'saramin',
  'jobkorea',
  'linkedin',
  'company_site',
  'headhunter',
  'referral',
  'remember',
  'rocketpunch',
  'other'
);

create type inbox_source as enum (
  'gmail',
  'email_manual',
  'kakao_paste',
  'sms_paste',
  'dm_paste',
  'manual'
);

create type inbox_status as enum (
  'pending',
  'linked',
  'ignored',
  'needs_review'
);

create type event_type as enum (
  'application_submitted',
  'screening_started',
  'screening_passed',
  'interview_invited',
  'interview_scheduled',
  'assignment_sent',
  'coding_test_sent',
  'offer_negotiation',
  'final_accepted',
  'rejected',
  'follow_up',
  'note',
  'other'
);

create type todo_status as enum (
  'open',
  'done',
  'dismissed'
);
```

### Tables

Required tables:

- `applications`: 회사, 포지션, 채널, 상태, 지원일, 마감일, 마지막 연락일, 공고 URL/snapshot, 이력서/포트폴리오 버전, 우선순위, 다음 액션, 메모.
- `inbox_items`: 출처, 상태, 수신일, 제목, 발신자, 원문, provider metadata, 추출 필드, 추천 상태, 요약, confidence, parsed JSON, 연결된 application/event.
- `application_events`: 지원 건 타임라인 이벤트. Inbox item과 연결될 수 있고 수동 이벤트도 가능하다.
- `todos`: 지원 건 또는 inbox item에 연결될 수 있는 할 일.
- `qa_entries`: 지원서 질문과 제출 답변.
- `documents`: 실제 파일 업로드보다 메타데이터 저장을 우선한다.
- `email_accounts`: Gmail 계정과 암호화된 token metadata.
- `email_sync_logs`: 동기화 시작/종료/결과/오류 기록.

핵심 제약:

- `inbox_items`는 `unique(user_id, provider, provider_message_id)`로 Gmail 중복 저장을 막는다.
- `applications.priority`는 1에서 5 사이로 제한한다.
- 삭제 시 사용자 데이터는 cascade 또는 set null 정책을 명확히 적용한다.
- `linked_event_id`는 application event 생성 후 업데이트한다.

## 10. RLS와 보안

모든 사용자 데이터 테이블에 RLS를 적용한다.

```sql
alter table applications enable row level security;

create policy "Users can select own applications"
on applications for select
using (auth.uid() = user_id);

create policy "Users can insert own applications"
on applications for insert
with check (auth.uid() = user_id);

create policy "Users can update own applications"
on applications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own applications"
on applications for delete
using (auth.uid() = user_id);
```

같은 패턴을 `applications`, `inbox_items`, `application_events`, `todos`, `qa_entries`, `documents`, `email_accounts`, `email_sync_logs`에 적용한다.

보안 요구사항:

- `service_role` key는 서버/API route에서만 사용한다.
- 클라이언트에 service role key를 노출하지 않는다.
- Gmail token은 평문 저장하지 않는다.
- 카톡/문자 복붙 원문은 사용자가 삭제할 수 있어야 한다.
- export/delete 기능을 고려한 구조로 설계한다.

## 11. 상태와 이벤트 매핑

| event_type | suggested_status |
| --- | --- |
| `application_submitted` | `applied` |
| `screening_started` | `screening` |
| `screening_passed` | `interview_scheduling` |
| `interview_invited` | `interview_scheduling` |
| `interview_scheduled` | `first_interview` 또는 `second_interview` |
| `assignment_sent` | `assignment_or_test` |
| `coding_test_sent` | `assignment_or_test` |
| `offer_negotiation` | `offer_negotiation` |
| `final_accepted` | `accepted` |
| `rejected` | `rejected` |
| `follow_up` | 기존 상태 유지 |
| `note` | 기존 상태 유지 |
| `other` | `needs_review` |

상태 변경 규칙:

1. 사용자가 Inbox item을 연결할 때 상태 변경 여부를 체크박스로 선택한다.
2. 기본값은 `suggested_status`가 있고 confidence가 0.7 이상일 때만 체크한다.
3. `rejected`, `accepted`, `withdrawn`은 항상 사용자 확인을 받는다.
4. Event 생성은 상태 변경과 별개로 항상 가능하다.

## 12. 파서 명세

### Parser Input

```ts
export type ParseInput = {
  source: 'gmail' | 'email_manual' | 'kakao_paste' | 'sms_paste' | 'dm_paste' | 'manual';
  title?: string;
  sender?: string;
  rawText: string;
  receivedAt?: string;
  timezone?: string;
};
```

`timezone` 기본값은 `Asia/Seoul`이다.

### Parser Output

```ts
export type ParsedInboxItem = {
  extractedCompany: string | null;
  extractedRole: string | null;
  eventType:
    | 'application_submitted'
    | 'screening_started'
    | 'screening_passed'
    | 'interview_invited'
    | 'interview_scheduled'
    | 'assignment_sent'
    | 'coding_test_sent'
    | 'offer_negotiation'
    | 'final_accepted'
    | 'rejected'
    | 'follow_up'
    | 'note'
    | 'other';
  suggestedStatus:
    | 'interested'
    | 'planned'
    | 'applied'
    | 'screening'
    | 'assignment_or_test'
    | 'interview_scheduling'
    | 'first_interview'
    | 'second_interview'
    | 'final_interview'
    | 'offer_negotiation'
    | 'accepted'
    | 'rejected'
    | 'on_hold'
    | 'withdrawn'
    | null;
  eventAt: string | null;
  deadlineAt: string | null;
  actionRequired: string | null;
  summary: string;
  confidence: number;
  importantPhrases: string[];
};
```

### 규칙 기반 키워드

| event_type | 키워드 |
| --- | --- |
| `application_submitted` | 지원 완료, 접수 완료, 정상 접수, 입사지원이 완료 |
| `screening_started` | 서류 검토, 검토 중, 검토가 시작 |
| `screening_passed` | 서류 합격, 서류 전형 합격, 서류전형 합격, 다음 전형 |
| `interview_invited` | 면접 안내, 인터뷰 안내, 일정 선택, 면접 가능 일정 |
| `interview_scheduled` | 면접 확정, 인터뷰 확정, 일정이 확정, Google Meet, Zoom |
| `assignment_sent` | 과제, 사전과제, 과제 전형, 과제 제출 |
| `coding_test_sent` | 코딩테스트, 코딩 테스트, 알고리즘 테스트, 온라인 테스트 |
| `offer_negotiation` | 처우, 연봉, 오퍼, 입사 가능일, 보상 협의 |
| `final_accepted` | 최종 합격, 합격을 축하, 입사 제안, 오퍼 드립니다 |
| `rejected` | 불합격, 안타깝게도, 함께하기 어렵, 좋은 인연으로, 아쉽게도 |
| `follow_up` | 회신 부탁, 추가 자료, 확인 부탁, 리마인드 |

### 날짜 파싱

우선 지원할 형식:

- `YYYY-MM-DD`
- `YYYY.MM.DD`
- `YYYY년 M월 D일`
- `M월 D일`
- `오전/오후 H시`
- `HH:mm`
- `오늘`, `내일`, `이번 주`, `다음 주`

연도가 없는 `M월 D일`은 `receivedAt` 기준 같은 연도로 해석한다. 이미 지난 날짜가 되는 경우 다음 연도로 확정하지 말고 review flag 또는 낮은 confidence로 남긴다. 불확실한 날짜는 `eventAt = null`로 두고 raw phrase만 저장한다.

## 13. 지원 건 매칭 로직

Inbox item을 기존 Application과 자동 추천 매칭한다.

```text
score = 0

회사명이 정확히 일치하면 +60
회사명이 부분 일치하면 +40
포지션이 정확히 일치하면 +30
포지션이 부분 일치하면 +15
최근 90일 이내 지원이면 +10
현재 상태가 rejected/accepted가 아니면 +10
같은 채널/발신자 힌트가 있으면 +5
```

추천 기준:

- score >= 70: 강한 추천
- score 40~69: 후보로 보여주되 확인 필요
- score < 40: 자동 추천하지 않음

## 14. Inbox 연결 플로우

입력:

```ts
type LinkInboxRequest = {
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
```

처리 순서:

1. inbox item 조회
2. application 권한 확인
3. application_events 생성
4. inbox_items.status = `linked`
5. inbox_items.linked_application_id 업데이트
6. application.status 업데이트 optional
7. application.last_contact_at 업데이트
8. todo 생성 optional
9. transaction 처리

기본 Event title:

| event_type | title |
| --- | --- |
| `application_submitted` | 지원 완료 |
| `screening_passed` | 서류 합격 |
| `interview_invited` | 면접 일정 안내 |
| `interview_scheduled` | 면접 일정 확정 |
| `assignment_sent` | 과제 안내 |
| `coding_test_sent` | 코딩테스트 안내 |
| `offer_negotiation` | 처우 협의 안내 |
| `final_accepted` | 최종 합격 |
| `rejected` | 불합격 |
| `follow_up` | 추가 회신 필요 |
| `other` | 기타 안내 |

기본 Todo:

| event_type | todo |
| --- | --- |
| `interview_invited` | 면접 가능 일정 회신하기 |
| `interview_scheduled` | 면접 준비하기 |
| `assignment_sent` | 과제 제출하기 |
| `coding_test_sent` | 코딩테스트 응시하기 |
| `offer_negotiation` | 처우 정보 회신하기 |
| `follow_up` | 요청사항 회신하기 |

## 15. 화면별 상세 명세

### Dashboard

오늘 무엇을 봐야 하는지 빠르게 알 수 있어야 한다.

- 상태별 지원 건 수
- 오늘/이번 주 할 일
- 최근 Inbox 후보
- 최근 업데이트된 지원 건
- 결과 대기 오래된 지원 건

### Applications list

필터:

- 상태
- 채널
- 회사명/포지션 검색
- 우선순위
- 최근 연락일

표시:

- 회사
- 포지션
- 상태 badge
- 지원 채널
- 지원일
- 마지막 연락일
- 다음 액션

모바일에서는 카드 형태로 표시한다.

### Application detail

상단:

- 회사명 / 포지션
- 현재 상태
- 지원 채널
- 지원일
- 마지막 연락일
- 다음 액션
- 공고 URL

탭 또는 섹션:

- Timeline
- Q&A
- Todos
- Documents
- Memo
- Raw job post snapshot

### Inbox list

필터:

- pending
- needs_review
- linked
- ignored
- source
- confidence

표시:

- 출처 badge
- 받은 날짜
- 요약
- 추정 회사/포지션
- 이벤트 유형
- confidence
- 추천 연결 후보
- 액션: 연결 / 무시 / 수정

### Inbox new paste

폼:

- source: `kakao_paste` / `sms_paste` / `dm_paste` / `email_manual` / `manual`
- title optional
- received_at default now
- raw_text textarea
- button: `분석하고 수신함에 추가`

결과:

- 파싱 결과 preview
- 추천 application 후보
- 저장 후 `/inbox/[id]` 또는 `/inbox`로 이동

### Todos

필터:

- open
- done
- due today
- overdue
- application

표시:

- 제목
- 연결된 회사/포지션
- 마감일
- 상태

## 16. Gmail 연동 명세

MVP에서 Gmail은 메일을 자동으로 읽어 Inbox 후보를 생성하는 것까지만 한다. 지원 건 상태 변경은 사용자가 확인한다.

권장 scope:

```text
https://www.googleapis.com/auth/gmail.readonly
```

검색 쿼리는 최근 90일 기준으로 여러 쿼리로 나눠 실행할 수 있다.

```text
newer_than:90d (서류 OR 면접 OR 인터뷰)
newer_than:90d (과제 OR 코딩테스트 OR 테스트)
newer_than:90d (합격 OR 불합격 OR 결과)
newer_than:90d (채용 OR 지원 OR 전형)
newer_than:90d (처우 OR 오퍼 OR 입사)
```

동기화 알고리즘:

1. `email_accounts`에서 사용자의 Gmail 계정을 찾는다.
2. refresh token으로 access token을 확보한다.
3. Gmail `messages.list`로 후보 message id를 가져온다.
4. 각 message id에 대해 `messages.get`으로 subject/snippet/body를 가져온다.
5. `provider_message_id` 기준으로 `inbox_items` 중복을 방지한다.
6. parser로 채용 관련성을 판단한다.
7. confidence가 0.4 이상이면 pending inbox item으로 저장한다.
8. 너무 낮으면 저장하지 않거나 ignored/needs_review 후보로 저장한다.
9. sync log를 남긴다.

메일 본문 처리:

- HTML body는 plain text로 변환한다.
- 너무 긴 본문은 앞부분과 중요한 문장만 저장한다.
- MVP는 raw_text를 저장하되 사용자가 삭제할 수 있게 한다.
- 같은 thread의 여러 메시지는 각각 inbox item으로 둘 수 있다.

## 17. 컴포넌트와 서버 로직 구조

권장 컴포넌트:

```text
components/
  layout/
    AppShell.tsx
    SidebarNav.tsx
    MobileBottomNav.tsx
  applications/
    ApplicationCard.tsx
    ApplicationTable.tsx
    ApplicationForm.tsx
    StatusBadge.tsx
    ApplicationTimeline.tsx
    ApplicationQuickFacts.tsx
  inbox/
    InboxItemCard.tsx
    InboxItemTable.tsx
    PasteInboxForm.tsx
    ParsedPreview.tsx
    LinkInboxDialog.tsx
    SourceBadge.tsx
  todos/
    TodoList.tsx
    TodoItem.tsx
  qa/
    QAList.tsx
    QAForm.tsx
  common/
    EmptyState.tsx
    ConfirmDialog.tsx
    DateTimeText.tsx
```

권장 서버 로직:

```text
lib/
  supabase/
    client.ts
    server.ts
  parser/
    index.ts
    ruleBasedParser.ts
    llmParser.ts
    dateParser.ts
  gmail/
    auth.ts
    client.ts
    sync.ts
    body.ts
  applications/
    status.ts
    matching.ts
```

## 18. 구현 순서

### Phase 1: Core CRUD + 반응형 UI

1. Next.js + TypeScript + Tailwind 프로젝트 세팅
2. Supabase 연결
3. Auth 구현
4. DB migration 작성
5. RLS 적용
6. AppShell, desktop sidebar, mobile bottom nav 구현
7. Applications CRUD
8. Application detail + timeline 수동 이벤트 구현
9. Todos CRUD
10. Q&A CRUD

완료 기준:

- 사용자가 지원 건을 만들고 수정/삭제할 수 있다.
- 지원 상세에서 timeline, todos, q&a를 볼 수 있다.
- 모바일에서도 주요 정보가 깨지지 않는다.

### Phase 2: Inbox + 카톡 복붙

1. `/inbox` 목록 구현
2. `/inbox/new` 붙여넣기 폼 구현
3. 규칙 기반 파서 구현
4. 파싱 결과 preview 구현
5. Inbox item 저장
6. 기존 Application 추천 매칭 구현
7. Inbox item 연결 dialog 구현
8. 연결 시 Event 생성 + 상태 변경 optional + Todo 생성 optional

완료 기준:

- 카톡 메시지를 붙여넣으면 Inbox 후보가 생긴다.
- Inbox 후보를 지원 건에 연결하면 timeline event가 생긴다.
- 필요 시 application status와 todo가 업데이트된다.

### Phase 3: Gmail 연동

1. Gmail OAuth flow 구현
2. email_accounts 저장
3. token refresh 구현
4. `/api/gmail/sync` 구현
5. messages.list + messages.get 구현
6. 메일 본문 plain text 변환
7. 파서 적용
8. 중복 방지
9. sync log 표시

완료 기준:

- 사용자가 Gmail을 연결할 수 있다.
- 최근 채용 관련 메일이 Inbox 후보로 들어온다.
- 후보를 지원 건에 연결할 수 있다.

### Phase 4: 사용성 개선

1. Dashboard 요약
2. 검색/필터 강화
3. 데이터 export
4. raw_text 삭제
5. 공고 snapshot 필드 개선
6. 파일 업로드 optional

## 19. 테스트 케이스

### 카톡 복붙: 서류 합격 + 면접 일정 선택

입력:

```text
안녕하세요. A회사 채용담당자입니다.
지원하신 Product Manager 포지션 서류 전형에 합격하셨습니다.
1차 인터뷰 일정을 아래 링크에서 선택 부탁드립니다.
감사합니다.
```

기대:

```json
{
  "extractedCompany": "A회사",
  "extractedRole": "Product Manager",
  "eventType": "screening_passed",
  "suggestedStatus": "interview_scheduling",
  "actionRequired": "1차 인터뷰 일정 선택",
  "confidence": 0.7
}
```

### 카톡 복붙: 면접 확정

입력:

```text
1차 인터뷰는 4월 30일 오후 3시 Google Meet으로 진행됩니다.
참석 가능 여부 회신 부탁드립니다.
```

기대:

```json
{
  "eventType": "interview_scheduled",
  "suggestedStatus": "first_interview",
  "eventAt": "2026-04-30T15:00:00+09:00",
  "actionRequired": "참석 가능 여부 회신",
  "confidence": 0.6
}
```

회사명이 없으므로 `extractedCompany = null`이어야 한다.

### 메일: 불합격

입력:

```text
안녕하세요. B회사 채용팀입니다.
귀한 시간을 내어 지원해주셔서 감사합니다.
안타깝게도 이번 전형에서는 함께하기 어렵게 되었습니다.
앞으로 더 좋은 인연으로 만나뵙기를 바랍니다.
```

기대:

```json
{
  "extractedCompany": "B회사",
  "eventType": "rejected",
  "suggestedStatus": "rejected",
  "confidence": 0.8
}
```

UI에서는 상태 변경 체크박스를 기본 체크하더라도 사용자의 명시 확인을 받아야 한다.

### 메일: 과제 안내

입력:

```text
C회사 과제 전형 안내드립니다.
과제 제출 마감은 2026년 5월 7일 23:59입니다.
첨부된 가이드를 확인하시고 기한 내 제출 부탁드립니다.
```

기대:

```json
{
  "extractedCompany": "C회사",
  "eventType": "assignment_sent",
  "suggestedStatus": "assignment_or_test",
  "deadlineAt": "2026-05-07T23:59:00+09:00",
  "actionRequired": "과제 제출",
  "confidence": 0.8
}
```

### 일반 뉴스레터

입력:

```text
이번 주 인기 채용 공고를 확인해보세요.
다양한 기업에서 새로운 포지션을 오픈했습니다.
```

기대:

```json
{
  "eventType": "other",
  "suggestedStatus": null,
  "confidence": 0.2
}
```

Inbox에 저장하지 않거나 needs_review로 저장한다.

## 20. 개발용 Seed Data

Applications:

1. A회사 / Product Manager / wanted / screening
2. B회사 / Product Owner / company_site / applied
3. C회사 / Backend Engineer / linkedin / assignment_or_test
4. D회사 / Data Analyst / saramin / rejected

Inbox:

1. A회사 서류 합격 메일 후보
2. B회사 카톡 면접 일정 선택 후보
3. C회사 과제 안내 후보
4. 뉴스레터 ignored 후보

Todos:

1. A회사 면접 가능 일정 회신
2. C회사 과제 제출

Q&A:

1. A회사 지원 동기
2. B회사 협업 경험

## 21. Acceptance Criteria

### Core

- [ ] 로그인한 사용자만 자기 데이터를 볼 수 있다.
- [ ] 지원 건 CRUD가 동작한다.
- [ ] 지원 상태 badge가 올바르게 표시된다.
- [ ] 모바일 화면에서 지원 목록과 상세가 사용 가능하다.
- [ ] 지원 상세에 timeline이 표시된다.
- [ ] 지원 상세에 Q&A와 Todo를 추가할 수 있다.

### Inbox / Paste

- [ ] 사용자가 카톡/문자/DM 원문을 붙여넣을 수 있다.
- [ ] 붙여넣은 원문이 파싱되어 Inbox 후보로 저장된다.
- [ ] 파싱 결과 preview가 표시된다.
- [ ] 기존 지원 건 추천 매칭이 표시된다.
- [ ] Inbox 후보를 지원 건에 연결하면 Event가 생성된다.
- [ ] 연결 시 상태 변경 여부를 사용자가 선택할 수 있다.
- [ ] 연결 시 Todo 생성 여부를 사용자가 선택할 수 있다.
- [ ] Inbox 후보를 무시할 수 있다.

### Gmail

- [ ] 사용자가 Gmail 계정을 연결할 수 있다.
- [ ] Gmail token은 서버에서만 처리된다.
- [ ] 최근 채용 관련 메일을 검색한다.
- [ ] 중복 message는 다시 저장하지 않는다.
- [ ] 채용 관련성이 있는 메일만 Inbox 후보가 된다.
- [ ] sync log가 남는다.

### Security

- [ ] Supabase RLS가 모든 사용자 데이터 테이블에 적용된다.
- [ ] 다른 사용자의 application/inbox/event/todo에 접근할 수 없다.
- [ ] service role key는 클라이언트 번들에 포함되지 않는다.
- [ ] raw_text 삭제 기능 또는 삭제 가능한 구조가 있다.

## 22. 개발 중 주의사항

1. 상태 이름은 내부 enum과 사용자 표시명을 분리한다.
2. 날짜는 DB에는 UTC `timestamptz`로 저장하고 UI에서는 Asia/Seoul로 표시한다.
3. 파서 confidence가 낮은 항목은 needs_review로 보낸다.
4. Gmail sync는 실패해도 core app이 망가지지 않게 한다.
5. 원문 본문이 너무 긴 경우 truncation 정책을 둔다.
6. 카카오톡 직접 연동으로 확장하지 않는다.
7. 사용자 확인 없는 자동 상태 변경을 하지 않는다.
8. 모바일 UI에서 표보다 카드 표현을 우선한다.
9. Inbox 연결 작업은 가능하면 transaction으로 처리한다.
10. MVP에서는 통계보다 기록과 누락 방지에 집중한다.

## 23. 향후 확장 아이디어

- 브라우저 공고 클리퍼
- 공고 snapshot 자동 저장
- LLM 파서 고도화
- 면접 준비팩 생성
- 이력서 버전별 성과 분석
- 채널별 응답률 분석
- 캘린더 연동
- 안드로이드 알림 기반 카톡 후보 감지
- Notion/CSV export
- 파일 업로드 및 제출 문서 버전 관리
- 크롬 확장 프로그램
- PWA offline cache

## 24. 공식 문서

- Next.js App Router docs: https://nextjs.org/docs/app
- Supabase Row Level Security docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Gmail API users.messages.list docs: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list
- Gmail API scopes docs: https://developers.google.com/workspace/gmail/api/auth/scopes
