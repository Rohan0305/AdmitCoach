import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audio = formData.get("audio") as File;
  const question = formData.get("question") as string;

  // 1. Transcribe audio with OpenAI Whisper
  const transcriptResp = await openai.audio.transcriptions.create({
    file: audio, // Use the File object directly
    model: "whisper-1",
    response_format: "text",
    // language: 'en', // optional
  });
  const transcript = (transcriptResp as any).text ?? transcriptResp;

  // 2. Get AI feedback from OpenAI Chat API
  const prompt = `
You are an expert medical school interview coach. Grade the following answer to the given question in four categories (0-10 each): Content, Delivery, Structure, and Overall. Provide a brief, actionable comment. Return your response as JSON in this format:

{
  "text": "Your answer was clear and relevant. Try to elaborate more on your personal motivation.",
  "contentScore": 8,
  "deliveryScore": 7,
  "structureScore": 9,
  "overallScore": 8
}

Question: ${question}
Transcript: ${transcript}
`;

  const chatResp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful and strict medical school interview coach.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  // Extract JSON from the response
  let feedback;
  try {
    const match = chatResp.choices[0].message.content?.match(/\{[\s\S]*\}/);
    feedback = match
      ? JSON.parse(match[0])
      : {
          text: chatResp.choices[0].message.content,
          contentScore: null,
          deliveryScore: null,
          structureScore: null,
          overallScore: null,
        };
  } catch (e) {
    feedback = {
      text: chatResp.choices[0].message.content,
      contentScore: null,
      deliveryScore: null,
      structureScore: null,
      overallScore: null,
    };
  }

  return NextResponse.json(feedback);
}
