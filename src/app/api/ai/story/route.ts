import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { keywords, tone } = await request.json();
    
    // In a real application, this would call the OpenAI or Gemini API
    // const response = await openai.createCompletion({ ... })
    
    // Mocked AI Response
    const aiStory = `Generated Story (Mocked): Rooted in the traditions of ${keywords.join(', ')}, this creation embodies a ${tone} spirit. Every thread and contour reflects generations of mastery, bringing a piece of authentic heritage directly into your modern lifestyle.`;

    return NextResponse.json({ story: aiStory });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate AI story' }, { status: 500 });
  }
}
