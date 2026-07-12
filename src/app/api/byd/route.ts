import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_URL = "https://api.n8n.triade-ia.shop/webhook/BYD";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        proxy: "vercel_api_byd",
        receivedAt: new Date().toISOString(),
      }),
      cache: "no-store",
    });

    const text = await upstream.text();
    return NextResponse.json(
      { ok: upstream.ok, n8nStatus: upstream.status, n8nResponse: text },
      { status: upstream.ok ? 200 : 502 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "webhook_proxy_failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
