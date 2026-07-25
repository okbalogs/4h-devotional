import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) 
  : null;

export async function POST(req) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { verseRef, verseText } = body;

    if (!verseRef || !verseText) {
      return NextResponse.json(
        { error: 'verseRef and verseText are required.' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a theological assistant helping a believer with their daily devotional (Quiet Time).
The user is studying the following Bible verse:
Reference: ${verseRef}
Text: "${verseText}"

Provide devotional insights in strict JSON format. Do not use Markdown backticks.
The JSON must have exactly the following structure:
{
  "context": "A 2-3 sentence explanation of the historical or literary context of this verse.",
  "crossReferences": [
    "List exactly 2 or 3 related Bible references (e.g. 'John 3:16') that deepen the understanding"
  ],
  "reflection": "A single, thought-provoking question to help the user apply this verse to their heart and daily life."
}
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const responseText = result.response.text();
    let jsonResult;
    try {
      jsonResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText);
      return NextResponse.json({ error: 'Invalid response from AI.' }, { status: 500 });
    }

    return NextResponse.json(jsonResult);
  } catch (error) {
    console.error('[AI Insights Route Error]', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating insights.' },
      { status: 500 }
    );
  }
}
