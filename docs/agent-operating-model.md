# Agent Operating Model

이 문서는 에이전트가 지원로그 저장소에서 작업할 때 따르는 운영 기준이다. OpenAI의 Harness Engineering 글에서 제안하는 방식처럼, `AGENTS.md`는 짧은 진입점으로 유지하고 실제 지식은 버전 관리되는 문서로 나눈다.

참고: https://openai.com/ko-KR/index/harness-engineering/

## Core Idea

에이전트가 처음부터 모든 세부 지침을 읽도록 만들지 않는다. `AGENTS.md`는 목차이고, 실제 판단에는 `SPEC.md`, `ARCHITECTURE.md`, `docs/coding-patterns.md`를 필요한 만큼 열어본다.

문서의 역할은 다음처럼 나눈다.

- `SPEC.md`: 무엇을 만들지, 왜 만드는지, 어떤 동작이 성공인지.
- `ARCHITECTURE.md`: 코드가 어디에 속하고 레이어 경계가 무엇인지.
- `docs/coding-patterns.md`: 코드를 어떤 모양으로 작성할지.
- `docs/implementation-roadmap.md`: 어떤 순서로 만들지.
- `docs/quality-and-security.md`: 무엇을 검증하고 지켜야 하는지.

## Before Working

작업 전에 다음 순서로 필요한 문맥을 모은다.

1. 제품 동작, MVP 범위, acceptance criteria는 `SPEC.md`를 확인한다.
2. 구조, 소유권, 데이터 흐름, 레이어 경계는 `ARCHITECTURE.md`를 확인한다.
3. 구현 스타일, 폼, API/service/hook/component 패턴은 `docs/coding-patterns.md`를 확인한다.
4. Phase 진행, 구현 순서, 범위 판단은 `docs/implementation-roadmap.md`를 확인한다.
5. 인증, RLS, token, 개인정보, 테스트는 `docs/quality-and-security.md`를 확인한다.

## Decision Rules

- 기존 문서에 명시된 결정이 있으면 그 결정을 따른다.
- 문서끼리 충돌하면 제품 의도는 `SPEC.md`, 구조는 `ARCHITECTURE.md`, 코드 형태는 `docs/coding-patterns.md`를 우선한다.
- 구현 중 반복되는 새 패턴이 생기면 `docs/coding-patterns.md`에 짧게 기록한다.
- 새로운 구조 경계나 데이터 흐름을 만들면 `ARCHITECTURE.md`를 갱신한다.
- 큰 기능 계획이나 완료 기준은 `docs/implementation-roadmap.md`에 반영한다.

## Documentation Hygiene

- 한 문서가 너무 길어지면 목적별 문서로 분리한다.
- `AGENTS.md`에는 상세 규칙을 넣지 않고 링크와 중요한 불변 조건만 둔다.
- 오래된 구현 지침은 제거하거나 현재 동작에 맞춰 갱신한다.
- 문서에는 에이전트가 검색할 수 있는 실제 파일명, 라우트, enum, 테이블명을 사용한다.

## Non-Negotiables

- 사용자 확인 없는 상태 변경 금지.
- 모든 외부 입력은 Inbox를 먼저 거친다.
- Gmail token 평문 저장 금지.
- service role key 클라이언트 노출 금지.
- 카카오톡 직접 연동 금지.
- 모바일 사용성을 Core CRUD와 Inbox flow의 완료 기준에 포함한다.
