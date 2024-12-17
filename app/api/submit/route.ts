// app/api/submit/route.ts
import { NextResponse } from 'next/server';
import { saveSubmission } from '@/src/index';
import { NewSubmission } from '@/src/db/schema';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || content.length < 50) {
      return NextResponse.json({ error: 'Content too short.' }, { status: 400 });
    }

    // Split the text into sentences
    const sentences = splitIntoSentences(content);

    // Prepare new submission data
    const newSubmission: NewSubmission = {
      content,
      sentences,
    };

    // Save the submission
    const submission = await saveSubmission(newSubmission);

    return NextResponse.json({ id: submission.id });
  } catch (error) {
    console.error('Error in submission:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your text.' },
      { status: 500 }
    );
  }
}

function splitIntoSentences(text: string): string[] {
  // Simple regex-based sentence splitter
  return text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
}
