# Supabase Setup

## Cloud Project Migration

Supabase 웹 SQL Editor 대신 CLI로 migration을 적용할 수 있다.

1. Supabase access token으로 로그인한다.

```bash
npm run db:login
```

2. 프로젝트를 연결한다.

```bash
npm run db:link -- --project-ref <your-project-ref>
```

`project-ref`는 Supabase 프로젝트 URL의 ref 값이다.

3. migration을 적용한다.

```bash
npm run db:push
```

이 명령은 `supabase/migrations/*.sql`을 연결된 Supabase 프로젝트 DB에 적용한다.

## Environment Variables

`.env.local`에 다음 값을 넣는다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TOKEN_ENCRYPTION_KEY=at-least-32-characters
CRON_SECRET=random-strong-secret
```

`TOKEN_ENCRYPTION_KEY`는 Google provider token을 암호화해 저장하기 위해 필요하며 32자 이상이어야 한다.
`CRON_SECRET`은 배포된 cron API를 보호하는 서버 전용 bearer token이다.

## Google Auth + Gmail

이 앱은 개인용 MVP 기준으로 Google 로그인과 Gmail 읽기 권한을 한 번에 요청한다.

1. Supabase Dashboard > Authentication > Providers > Google을 켠다.
2. Google Cloud OAuth consent screen에 다음 scope를 추가한다.

```text
openid
email
profile
https://www.googleapis.com/auth/gmail.readonly
```

3. Supabase redirect allow list에 로컬 callback을 추가한다.

```text
http://localhost:3001/auth/callback
```

4. Google OAuth client의 authorized redirect URI에는 Supabase가 안내하는 callback URL을 추가한다.

Gmail readonly scope는 민감 scope다. 개인용 테스트는 Google Cloud의 test user로 시작하고, 공개 배포 전에는 Google verification과 privacy policy를 준비해야 한다.

## Vercel Cron

개인용 자동 수집은 Vercel Cron이 30분마다 `/api/cron/gmail-sync`를 호출하는 방식으로 운영한다.

1. Vercel 프로젝트에 `CRON_SECRET` 환경 변수를 추가한다.
2. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TOKEN_ENCRYPTION_KEY`, Gmail OAuth 환경 변수를 모두 Production 환경에 추가한다.
3. 배포 후 Vercel Dashboard > Settings > Cron Jobs에서 `/api/cron/gmail-sync`가 등록되었는지 확인한다.
4. cron 실행 결과는 API 응답과 `email_sync_logs`에서 확인한다.

`/api/cron/gmail-sync`는 `Authorization: Bearer <CRON_SECRET>` 헤더가 없으면 401을 반환한다. Vercel은 프로젝트에 `CRON_SECRET`이 설정되어 있으면 cron 요청에 이 헤더를 자동으로 붙인다.

## Legacy Gmail OAuth

`/api/gmail/connect`, `/api/gmail/callback` 라우트는 과거 별도 Gmail 연결 흐름을 위해 남겨둔다. 현재 UI는 Supabase Google OAuth 단일 흐름을 사용한다.
