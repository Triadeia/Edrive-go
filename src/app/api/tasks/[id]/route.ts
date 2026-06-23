import { NextResponse } from "next/server";
import { tasksStore } from "@/lib/tasks-store";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const task = tasksStore.update(id, body);
  if (!task) return NextResponse.json({ error: "Tarefa nao encontrada" }, { status: 404 });
  return NextResponse.json(task);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = tasksStore.remove(id);
  if (!removed) return NextResponse.json({ error: "Tarefa nao encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
