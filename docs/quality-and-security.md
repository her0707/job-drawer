# Quality and Security

이 문서는 지원로그 MVP의 검증 기준, 보안 불변 조건, 테스트 체크리스트를 다룬다.

## Security Invariants

- 모든 사용자 데이터 테이블은 `user_id = auth.uid()` 기준 RLS를 적용한다.
- 다른 사용자의 application, inbox item, event, todo, q&a, document, email account, sync log에 접근할 수 없어야 한다.
- `service_role` key는 서버/API route에서만 사용한다.
- service role key와 Gmail token은 클라이언트 번들에 포함되면 안 된다.
- Gmail token은 평문 저장하지 않는다.
- 카카오톡/문자/메일 원문은 사용자가 삭제할 수 있어야 한다.
- 사용자의 채용 데이터를 모델 학습에 사용하지 않는다는 제품 원칙을 유지한다.

## Parser Quality

최소 parser 테스트:

- 서류 합격 + 면접 일정 선택.
- 면접 확정.
- 불합격 메일.
- 과제 안내.
- 일반 뉴스레터.

기준:

- 회사명이 없으면 `extractedCompany = null`을 유지한다.
- 불확실한 날짜는 확정하지 않고 `eventAt = null` 또는 낮은 confidence로 둔다.
- confidence가 낮은 항목은 저장 제외 또는 `needs_review`로 처리한다.
- `accepted`, `rejected`, `withdrawn`은 사용자 확인이 필요하다.

## Core Acceptance Checks

- 로그인한 사용자만 자기 데이터를 볼 수 있다.
- 지원 건 CRUD가 동작한다.
- 지원 상태 badge가 올바르게 표시된다.
- 모바일 화면에서 지원 목록과 상세가 사용 가능하다.
- 지원 상세에 timeline이 표시된다.
- 지원 상세에 Q&A와 Todo를 추가할 수 있다.

## Inbox Acceptance Checks

- 사용자가 카톡/문자/DM 원문을 붙여넣을 수 있다.
- 붙여넣은 원문이 파싱되어 Inbox 후보로 저장된다.
- 파싱 결과 preview가 표시된다.
- 기존 지원 건 추천 매칭이 표시된다.
- Inbox 후보를 지원 건에 연결하면 Event가 생성된다.
- 연결 시 상태 변경 여부를 사용자가 선택할 수 있다.
- 연결 시 Todo 생성 여부를 사용자가 선택할 수 있다.
- Inbox 후보를 무시할 수 있다.

## Gmail Acceptance Checks

- 사용자가 Gmail 계정을 연결할 수 있다.
- Gmail token은 서버에서만 처리된다.
- 최근 채용 관련 메일을 검색한다.
- 중복 message는 다시 저장하지 않는다.
- 채용 관련성이 있는 메일만 Inbox 후보가 된다.
- sync log가 남는다.

## Manual Verification

UI 작업 후 최소한 다음 화면을 데스크톱과 모바일 폭에서 확인한다.

- `/dashboard`
- `/applications`
- `/applications/[id]`
- `/inbox`
- `/inbox/new`
- `/todos`
- `/settings/integrations`

검증 포인트:

- 주요 텍스트가 버튼/카드 밖으로 넘치지 않는다.
- 모바일에서는 표보다 카드가 우선이다.
- 중요한 액션은 터치 가능한 크기와 위치를 가진다.
- 빈 상태와 오류 상태가 존재한다.
