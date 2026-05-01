import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/api/http";
import { createRouteSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await readJson<Record<string, unknown>>(request);
  const { data, error } = await supabase
    .from("application_events")
    .insert({
      user_id: user.id,
      application_id: id,
      event_type: body.event_type as never,
      title: String(body.title ?? ""),
      body: (body.body as string) || null,
      occurred_at: (body.occurred_at as string) || new Date().toISOString(),
      source: "manual"
    })
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ event: data }, { status: 201 });
}
