export function DateTimeText({ value, fallback = "-" }: { value?: string | null; fallback?: string }) {
  if (!value) return <span>{fallback}</span>;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <span>{fallback}</span>;

  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        dateStyle: "medium",
        timeStyle: value.includes("T") ? "short" : undefined
      }).format(date)}
    </time>
  );
}
