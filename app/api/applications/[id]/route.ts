import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/api/http";
import { createRouteSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await readJson<Record<string, unknown>>(request);
  const { data, error } = await supabase
    .from("applications")
    .update({
      company: String(body.company ?? ""),
      role: String(body.role ?? ""),
      channel: body.channel as never,
      status: body.status as never,
      applied_at: (body.applied_at as string) || null,
      deadline_at: (body.deadline_at as string) || null,
      job_post_url: (body.job_post_url as string) || null,
      job_post_snapshot: (body.job_post_snapshot as string) || null,
      resume_version: (body.resume_version as string) || null,
      portfolio_version: (body.portfolio_version as string) || null,
      priority: Number(body.priority ?? 3),
      next_action: (body.next_action as string) || null,
      next_action_due_at: (body.next_action_due_at as string) || null,
      memo: (body.memo as string) || null
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ application: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { error } = await supabase.from("applications").delete().eq("id", id).eq("user_id", user.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
