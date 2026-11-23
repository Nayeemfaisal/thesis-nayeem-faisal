const ALLOWED_TOPICS = new Set(["Portfolio", "Bachelorarbeit", "Forschungszusammenarbeit", "Softwareprojekt", "Sonstiges"]);

export async function POST(request: Request) {
  if (!(request.headers.get("content-type") || "").includes("application/json")) return Response.json({ error: "JSON ist erforderlich." }, { status: 415 });
  const body = await request.json().catch(() => null) as { name?: unknown; topic?: unknown; question?: unknown; website?: unknown } | null;
  if (!body || body.website) return Response.json({ ok: true });
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "Websitebesucher";
  const topic = typeof body.topic === "string" && ALLOWED_TOPICS.has(body.topic) ? body.topic : "Sonstiges";
  const question = typeof body.question === "string" ? body.question.trim().slice(0, 600) : "";
  if (question.length < 3) return Response.json({ error: "Bitte geben Sie eine vollständige Frage ein." }, { status: 400 });
  const baseUrl = process.env.OPENWA_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.OPENWA_API_KEY;
  const sessionId = process.env.OPENWA_SESSION_ID;
  const recipient = process.env.OPENWA_RECIPIENT?.replace(/\D/g, "");
  const text = ["Neue Frage von nayeemfaisal.com", `Name: ${name || "Websitebesucher"}`, `Thema: ${topic}`, `Frage: ${question}`].join("\n");
  if (!recipient) return Response.json({ error: "Der WhatsApp-Empfänger ist nicht konfiguriert." }, { status: 503 });
  if (!baseUrl || !apiKey || !sessionId) {
    return Response.json({ ok: true, delivery: "whatsapp", url: `https://wa.me/${recipient}?text=${encodeURIComponent(text)}` });
  }
  const response = await fetch(`${baseUrl}/api/sessions/${encodeURIComponent(sessionId)}/messages/send-text`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify({ chatId: `${recipient}@c.us`, text }), signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (!response?.ok) return Response.json({ error: "Die WhatsApp-Zustellung ist vorübergehend nicht verfügbar." }, { status: 502 });
  return Response.json({ ok: true });
}
