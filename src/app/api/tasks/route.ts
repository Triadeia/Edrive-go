import { NextResponse } from "next/server";
import { tasksStore } from "@/lib/tasks-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ tasks: tasksStore.list(), mode: "api" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const task = tasksStore.create(body);
  return NextResponse.json(task, { status: 201 });
}
