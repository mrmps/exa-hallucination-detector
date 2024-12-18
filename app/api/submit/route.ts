import { NextResponse } from 'next/server';
import { saveSubmission } from '@/src/index';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content?.trim() || content.trim().length < 50) {
      return NextResponse.json({ error: 'Content too short.' }, { status: 400 });
    }

    const submission = await saveSubmission({ content });
    return NextResponse.json({ id: submission.id });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Submission failed.' }, { status: 500 });
  }
}