// app/api/submit/route.ts
import { NextResponse } from 'next/server';
import { saveSubmission } from '@/src/index';
import { NewSubmission } from '@/src/db/schema';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (typeof content !== 'string' || content.trim().length < 50) {
      return NextResponse.json({ error: 'Content too short.' }, { status: 400 });
    }

    // Split the text into sentences
    const sentences = splitIntoSentences(content);
    if (sentences.length === 0) {
      return NextResponse.json({ error: 'No valid sentences found.' }, { status: 400 });
    }

    // Prepare new submission data
    const newSubmission: NewSubmission = {
      content,
      sentences,
    };

    // Save the submission
    const submission = await saveSubmission(newSubmission);

    return NextResponse.json({ id: submission.id }, { status: 200 });
  } catch (error) {
    console.error('Error in submission:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your text.' },
      { status: 500 }
    );
  }
}

function splitIntoSentences(text: string): string[] {
  // This regex attempts to split on ., !, or ? followed by a space or end-of-string
  // It also trims spaces and filters out empty entries.
  const rawSentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  return rawSentences
    .map(s => s.trim())
    .filter(s => s.length > 0);
}
