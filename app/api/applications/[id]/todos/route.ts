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
    .from("todos")
    .insert({
      user_id: user.id,
      application_id: id,
      title: String(body.title ?? ""),
      description: (body.description as string) || null,
      due_at: (body.due_at as string) || null
    })
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ todo: data }, { status: 201 });
}
