# 지원로그 Agent Guide

이 파일은 에이전트와 사람이 저장소 지식을 빠르게 찾기 위한 목차다. 상세한 규칙과 구현 기준은 연결된 문서를 열어 확인한다.

## Start Here

1. [SPEC.md](SPEC.md): 제품 목표, MVP 범위, 라우트, 데이터 모델, acceptance criteria.
2. [ARCHITECTURE.md](ARCHITECTURE.md): 애플리케이션 구조, 레이어 경계, 코드 소유권.
3. [docs/coding-patterns.md](docs/coding-patterns.md): 코드 배치, 네이밍, REST data access, 추출 기준.
4. [docs/agent-operating-model.md](docs/agent-operating-model.md): 에이전트 작업 방식, 문서 운영 기준, 우선순위 판단.
5. [docs/implementation-roadmap.md](docs/implementation-roadmap.md): Phase별 구현 순서와 완료 기준.
6. [docs/quality-and-security.md](docs/quality-and-security.md): 테스트, RLS, token, raw text, 수동 검증 기준.
7. [docs/design-system.md](docs/design-system.md): 디자인 토큰, 표면 규칙, 컴포넌트 시각 기준.

## Knowledge Map

```text
AGENTS.md
SPEC.md
ARCHITECTURE.md
docs/
  coding-patterns.md
  agent-operating-model.md
  implementation-roadmap.md
  quality-and-security.md
  design-system.md
```

## Working Rules

- `AGENTS.md`는 짧은 목차로 유지한다. 긴 정책, 체크리스트, 구현 세부사항은 목적별 문서로 옮긴다.
- 새 기능을 구현하기 전에는 `SPEC.md`에서 제품 의도를, `ARCHITECTURE.md`에서 구조 경계를, `docs/coding-patterns.md`에서 코드 패턴을 확인한다.
- 모든 외부 입력은 Inbox를 먼저 거친다. 사용자 확인 없이 지원 상태를 바꾸지 않는다.
- 카카오톡 직접 연동은 MVP 범위가 아니다. 복붙 입력만 지원한다.
- Gmail은 readonly scope 기반으로 Inbox 후보 생성까지만 자동화한다.
- 보안 관련 작업은 [docs/quality-and-security.md](docs/quality-and-security.md)를 따른다.
- UI 작업은 [.impeccable.md](.impeccable.md)와 [docs/design-system.md](docs/design-system.md)의 디자인 컨텍스트와 토큰 기준을 따른다.

## When Adding Docs

- 제품/도메인 결정은 `SPEC.md` 또는 그 하위 문서에 둔다.
- 구조, 레이어링, 소유권은 `ARCHITECTURE.md`에 둔다.
- 반복되는 코드 구현 방식은 `docs/coding-patterns.md`에 둔다.
- 디자인 토큰과 시각 규칙은 `docs/design-system.md`에 둔다.
- 에이전트 작업 절차, 구현 계획, 검증 루틴은 `docs/`의 목적별 문서에 둔다.
- 문서가 커지면 내용을 나누고 이 파일에는 링크만 추가한다.
