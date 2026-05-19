export function isCronRequestAuthorized(
  request: Request,
  secret = process.env.CRON_SECRET,
) {
  if (!secret) return false;

  return request.headers.get("authorization") === `Bearer ${secret}`;
}
