# 지원로그 Design System

## Direction

지원로그의 UI는 화이트/블랙 중심의 절제된 한국형 생산성 앱 톤을 따른다. 큰 블랙 타이포, 흰 배경, 옅은 회색 보조 표면, 8px radius의 명확한 액션을 기본으로 하되, 로그인 이후 화면은 매일 쓰는 업무툴처럼 빠르게 읽히는 밀도를 유지한다.

## Tokens

토큰은 `app/globals.css`의 `:root`에서 관리한다.

- Color: `--canvas`, `--panel`, `--panel-2`, `--ink`, `--muted`, `--line`, `--accent`, `--accent2`, `--good`, `--warn`, `--danger`
- Space: `--space-xs`부터 `--space-4xl`까지 4pt 기반 스케일
- Radius: `--radius-xs`, `--radius-sm`, `--radius-md`
- Typography: `--font-display`, `--font-body`

색상은 OKLCH 기반으로 정의한다. 화면 대부분은 흰색 표면과 옅은 회색 배경으로 유지하고, primary action은 블랙/화이트 대비로 처리한다.

## Component Classes

- `.surface`: 주요 패널과 상호작용 가능한 큰 블록
- `.surface-flat`: 보조 패널과 연결 UI
- `.paper`: 문서 조각, 목록 row, 기록 항목
- `.inset-panel`: 입력 보조 영역, 빈 상태, nested form
- `.eyebrow`: 제품/상태/분류 라벨
- `.type-display`: 제목과 숫자에 쓰는 display face
- `.hairline-table`: 지원 목록처럼 스캔이 중요한 표
- `.numeric`: dashboard metric 숫자

## Rules

- 새 화면은 Tailwind raw color보다 semantic token과 component class를 먼저 사용한다.
- 데스크톱은 표/목록 밀도를 우선하고, 모바일은 한 화면 한 과업 흐름을 우선한다.
- 카드 안에 다시 카드를 넣지 않는다. 내부 정보는 `.paper` 또는 `.inset-panel`로 낮은 위계를 만든다.
- primary button은 화면당 핵심 작업 하나에만 사용한다.
- button과 주요 interactive control의 기본 radius는 8px이다.
- 상태 badge와 위험/성공 색상은 의미가 있을 때만 사용한다.
- 한국어 레이블을 우선한다. 영문 제목은 API, Gmail, JSON처럼 고유명사일 때만 사용한다.
- 텍스트 hierarchy는 굵기와 간격으로 만들고, 장식용 아이콘과 효과는 최소화한다.
