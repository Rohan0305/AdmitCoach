import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { verifyFirebaseToken } from "@/lib/firebase-admin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify Firebase token
    const user = await verifyFirebaseToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    console.log('User authenticated:', user.uid);

    const formData = await req.formData();
    const audio = formData.get("audio") as File;
    const question = formData.get("question") as string;
    const programType = formData.get("programType") as string || "Medical School";

    console.log('Received request:', {
      audioSize: audio?.size,
      audioType: audio?.type,
      question: question?.substring(0, 100) + '...',
      programType
    });

    // Validate inputs
    if (!audio || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type and size
    if (!audio.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (audio.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    console.log('Starting audio transcription...');
    
    // 1. Transcribe audio with OpenAI Whisper
    const transcriptResp = await openai.audio.transcriptions.create({
      file: audio, // Use the File object directly
      model: "whisper-1",
      response_format: "text",
      // language: 'en', // optional
    });
    const transcript = typeof transcriptResp === 'string' ? transcriptResp : (transcriptResp as { text: string }).text;
    
    console.log('Transcription completed:', transcript?.substring(0, 100) + '...');

    // 2. Get AI feedback from OpenAI Chat API
    const prompt = `
You are a strict and experienced ${programType} interview coach with 20+ years of experience evaluating candidates. You are known for being thorough and realistic in your assessments, just like real admissions committees.

Your job is to evaluate this answer as if it were a real interview response that could make or break their application. Be critical but fair. Use the full 0-10 scale appropriately:
- 0-3: Poor/Unacceptable for professional school
- 4-5: Below average/Needs significant improvement
- 6-7: Average/Acceptable but unremarkable
- 8-9: Good/Above average
- 10: Exceptional/Outstanding

Evaluate in these categories:

CONTENT (0-10): 
- Relevance to question
- Depth of knowledge
- Specific examples provided
- Personal insight and reflection
- Evidence of preparation

DELIVERY (0-10):
- Clarity and articulation
- Confidence and composure
- Pace and flow
- Vocal quality and energy
- Professional demeanor

STRUCTURE (0-10):
- Logical organization
- Clear beginning, middle, end
- Smooth transitions
- Appropriate length
- Focus and coherence

OVERALL (0-10):
- Comprehensive assessment considering all factors
- Potential impact on admissions decision
- Areas that would impress or concern evaluators

Provide detailed, specific feedback that includes:
- What was done well (be specific)
- What needs improvement (be specific)
- Specific suggestions for better answers
- How this answer would be perceived by admissions committee
- What this reveals about the candidate's preparation

Return your response as JSON in this format:

{
  "text": "Detailed feedback with specific examples and actionable advice...",
  "contentScore": 6,
  "deliveryScore": 7,
  "structureScore": 5,
  "overallScore": 6,
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
  "suggestions": ["Specific suggestion 1", "Specific suggestion 2"],
  "admissionsPerspective": "How admissions committee would view this answer"
}

Question: ${question}
Transcript: ${transcript}
`;

    console.log('Sending request to OpenAI Chat API...');
    
    const chatResp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful and strict ${programType} interview coach.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    console.log('OpenAI response received, processing...');

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
      console.log('Feedback parsed successfully:', feedback);
    } catch (parseError) {
      console.error('Error parsing feedback JSON:', parseError);
      feedback = {
        text: chatResp.choices[0].message.content,
        contentScore: null,
        deliveryScore: null,
        structureScore: null,
        overallScore: null,
      };
    }

    console.log('Returning feedback to client');
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error in grade-interview API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
