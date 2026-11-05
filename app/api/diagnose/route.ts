import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "@/lib/prompt";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const { error, code } = await req.json();

  if (!error || typeof error !== "string") {
    return new Response("Please paste an error or a question.", { status: 400 });
  }
  if (error.length + (code?.length ?? 0) > 30000) {
    return new Response("Input too long. Please trim it.", { status: 400 });
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        const stream = await ai.models.generateContentStream({
          model: "gemini-3.5-flash",
          contents: `ERROR / QUESTION:\n${error}\n\nCODE / CONFIG:\n${code || "(none provided)"}`,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            maxOutputTokens: 4000,
          },
        });
        for await (const chunk of stream) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(chunk.text));
          }
        }
      } catch (err) {
        console.error("Gemini API error:", err);
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode("\n\nError: " + msg));
      }
      controller.close();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}