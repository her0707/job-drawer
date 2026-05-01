# Implementation Roadmap

이 문서는 구현 순서와 완료 기준만 다룬다. 상세 제품 명세는 `SPEC.md`, 구조 결정은 `ARCHITECTURE.md`, 코드 작성 패턴은 `docs/coding-patterns.md`를 따른다.

## Phase 1: Core CRUD + Responsive UI

목표: 사용자가 지원 건과 기본 기록을 직접 관리할 수 있게 한다.

작업:

- Next.js App Router + TypeScript + Tailwind 프로젝트 세팅.
- Supabase 연결과 Auth 구현.
- DB migration과 RLS 작성.
- AppShell, desktop sidebar, mobile bottom nav 구현.
- Applications CRUD 구현.
- Application detail과 수동 timeline event 구현.
- Todos CRUD 구현.
- Q&A CRUD 구현.

완료 기준:

- 로그인한 사용자가 자기 지원 건을 만들고 수정/삭제할 수 있다.
- 지원 상세에서 timeline, todos, q&a를 볼 수 있다.
- 모바일에서 지원 목록과 상세의 핵심 정보가 깨지지 않는다.

## Phase 2: Inbox + Paste Flow

목표: 카카오톡/문자/DM/수동 메모를 붙여넣어 Inbox 후보로 만들고 지원 건에 연결한다.

작업:

- `/inbox` 목록 구현.
- `/inbox/new` 붙여넣기 폼 구현.
- 규칙 기반 parser 구현.
- 파싱 결과 preview 구현.
- Inbox item 저장.
- 기존 Application 추천 매칭 구현.
- Inbox item 연결 dialog 구현.
- 연결 시 Event 생성, 상태 변경 optional, Todo 생성 optional 처리.

완료 기준:

- 카톡/문자/DM 원문을 붙여넣으면 Inbox 후보가 생긴다.
- 후보를 지원 건에 연결하면 timeline event가 생긴다.
- 사용자가 선택한 경우에만 application status와 todo가 업데이트된다.

## Phase 3: Gmail Integration

목표: Gmail을 readonly로 읽어 채용 관련 메일을 Inbox 후보로 만든다.

작업:

- Gmail OAuth flow 구현.
- `email_accounts` 저장.
- token refresh 구현.
- `/api/gmail/sync` 구현.
- Gmail `messages.list`와 `messages.get` 구현.
- 메일 본문 plain text 변환.
- parser 적용.
- `provider_message_id` 기반 중복 방지.
- sync log 표시.

완료 기준:

- 사용자가 Gmail 계정을 연결할 수 있다.
- 최근 채용 관련 메일이 Inbox 후보로 들어온다.
- 중복 message가 다시 저장되지 않는다.
- Gmail sync 실패가 core app을 깨뜨리지 않는다.

## Phase 4: Product Polish

목표: MVP 사용성을 높이고 데이터 소유권 기능을 보강한다.

작업:

- Dashboard 요약.
- 검색/필터 강화.
- 데이터 export.
- raw_text 삭제.
- 공고 snapshot 필드 개선.
- 파일 업로드 optional.

완료 기준:

- 사용자가 오늘 볼 일, 최근 Inbox, 오래된 대기 건을 빠르게 찾을 수 있다.
- 사용자가 자기 데이터를 export할 수 있다.
- 민감한 원문 텍스트를 삭제할 수 있다.

## Sequencing Rule

Core CRUD와 Paste Inbox flow가 Gmail보다 우선이다. Gmail은 자동화 편의 기능이며, 앱의 핵심 가치는 Application, Inbox, Timeline, Todo/Q&A 기록에 있다.
