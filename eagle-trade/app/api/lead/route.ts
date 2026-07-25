import { NextResponse } from "next/server";

/**
 * Lead capture endpoint. Currently logs the lead server-side — wire up
 * Resend/Formspree/CRM here when credentials are available.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { name, phone, location, type } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    typeof phone !== "string" ||
    phone.trim().length < 6
  ) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 422 });
  }

  console.log("[lead]", {
    name: name.trim(),
    phone: phone.trim(),
    location,
    type,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
