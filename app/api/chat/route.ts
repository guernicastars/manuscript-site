import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompts";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { message, history, chapterContext } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history
    if (Array.isArray(history)) {
      for (const m of history) {
        if (m.role === "user" || m.role === "assistant") {
          messages.push({ role: m.role, content: m.content });
        }
      }
    }

    // Build the user message with optional chapter context
    const userContent = chapterContext
      ? `[The reader is currently on this chapter:\n\n${chapterContext}\n\n---]\n\nReader's question: ${message}`
      : message;

    messages.push({ role: "user", content: userContent });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return Response.json({ response: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}
