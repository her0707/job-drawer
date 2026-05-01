# Job Drawer

Gmail에서 들어오는 채용 전형 메일을 수신함 후보로 모으고, 회사별 지원 기록으로 정리하는 개인용 지원 로그 MVP입니다.

## Features

- Google 로그인과 Gmail readonly 권한을 한 흐름으로 연결
- Gmail 동기화 시 연동 이후 메일만 수집
- 광고, 뉴스레터, 강의성 메일을 저장 전 필터링
- 수신함 후보에서 새 지원 건 생성 또는 기존 지원 건 연결
- 지원 건별 타임라인, Todo, Q&A 관리
- 메일 원문을 수신함에서 메일함처럼 확인
- Supabase Postgres, Auth, RLS 기반 사용자 데이터 분리
- JSON export와 원문 삭제 API 제공

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Auth/Postgres/RLS
- pnpm
- Vitest

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

기본 개발 서버는 Next.js 기본값인 `http://localhost:3000`입니다. 이미 포트가 사용 중이면 Next.js가 다른 포트를 제안합니다.

## Environment Variables

`.env.local`에 다음 값을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=http://localhost:3000/api/gmail/callback
TOKEN_ENCRYPTION_KEY=
```

`TOKEN_ENCRYPTION_KEY`는 32자 이상을 권장합니다. Gmail provider token 암호화에 사용되며 클라이언트에 노출하면 안 됩니다.

## Supabase Setup

Supabase CLI로 migration을 적용합니다.

```bash
pnpm db:login
pnpm db:link -- --project-ref <your-project-ref>
pnpm db:push
```

마이그레이션 파일은 `supabase/migrations/202604290001_init_job_drawer.sql`에 있습니다. 모든 사용자 데이터 테이블은 `user_id = auth.uid()` 기준 RLS 정책을 갖습니다.

자세한 설정은 `docs/supabase-setup.md`를 참고하세요.

## Google OAuth + Gmail

이 앱은 개인용 MVP 기준으로 Google 로그인 시 Gmail 읽기 권한을 함께 요청합니다.

Supabase Dashboard에서 Google provider를 활성화하고, Google Cloud OAuth consent screen에 다음 scope를 추가합니다.

```text
openid
email
profile
https://www.googleapis.com/auth/gmail.readonly
```

Supabase redirect allow list에는 로컬 callback을 추가합니다.

```text
http://localhost:3000/auth/callback
```

Gmail readonly scope는 Google 민감 scope입니다. 개인용 테스트는 Google Cloud test user로 시작하고, 공개 배포 전에는 verification과 privacy policy가 필요합니다.

## Scripts

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm start        # 빌드 결과 실행
pnpm lint         # ESLint
pnpm test         # Vitest
pnpm db:login     # Supabase CLI 로그인
pnpm db:link      # Supabase 프로젝트 연결
pnpm db:push      # migration 적용
pnpm db:diff      # migration diff 생성
```

## Project Structure

```text
app/                 Next.js routes and API route handlers
src/screens/         route-level screen composition
src/features/        domain feature components
src/components/      shared UI and layout components
src/lib/             Supabase, parser, Gmail, security, utility code
src/types/           domain and database types
supabase/            config, migrations, seed
docs/                product, architecture, security, design docs
tests/               parser and matching tests
```

## Notes

- 자동 동기화는 30분 주기 운영을 목표로 설계했습니다. 현재 UI에서는 수동 동기화 버튼을 통해 검증할 수 있습니다.
- Gmail 동기화는 연동 이후 시점의 메일만 대상으로 삼습니다.
- 원문 메일은 `raw_text`에 저장되며, 수신함에서 확인하거나 필요 시 삭제할 수 있습니다.
- 카카오톡 직접 연동은 MVP 범위가 아니며 붙여넣기 입력만 지원합니다.
