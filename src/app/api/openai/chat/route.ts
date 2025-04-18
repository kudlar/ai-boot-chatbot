import OpenAI from 'openai';
import { NextResponse } from "next/server";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    if (!model || !["gpt-4", "gpt-3.5-turbo"].includes(model)) {
      return NextResponse.json(
        { error: "Invalid model specified" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
    });

    // Create a TransformStream to extract only the text content
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        // Parse the chunk
        const text = decoder.decode(chunk);
        if (text === '[DONE]') return;
        
        try {
          // Remove 'data: ' prefix if it exists
          const jsonString = text.replace(/^data: /, '').trim();
          
          // Skip empty lines
          if (!jsonString) return;
          
          const json = JSON.parse(jsonString);
          
          // Extract content delta if it exists
          const contentDelta = json.choices?.[0]?.delta?.content;
          if (contentDelta) {
            controller.enqueue(encoder.encode(contentDelta));
          }
        } catch (error) {
          console.error('Error processing chunk:', error);
        }
      }
    });

    return new Response(
      response.toReadableStream().pipeThrough(transformStream)
    );
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
