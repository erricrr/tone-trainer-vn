import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.toString() ?? "";
  const lang = (searchParams.get("lang")?.toString() ?? "vi").toLowerCase();

  if (!text.trim()) {
    return NextResponse.json({ error: "Missing 'text' query param" }, { status: 400 });
  }

  // Google Translate TTS (undocumented). Works well for vi with accurate tones.
  // We proxy it server-side to avoid CORS and to set a proper User-Agent.
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    text
  )}&tl=${encodeURIComponent(lang)}&client=tw-ob`;

  try {
    // Add timeout for Netlify function limits (10s free, 26s pro)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout to stay under limits

    const response = await fetch(ttsUrl, {
      headers: {
        // Using a common browser UA improves success rate on Google's endpoint
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
        Accept: "*/*",
      },
      // Do not send cookies
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({ error: "Upstream TTS request failed" }, { status: response.status });
    }

      const arrayBuffer = await response.arrayBuffer();

  return new NextResponse(Buffer.from(arrayBuffer), {
    headers: {
      "Content-Type": "audio/mpeg",
      // Disable caching completely to prevent Netlify from serving wrong audio
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: "TTS request timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "TTS proxy error" }, { status: 502 });
  }
}
