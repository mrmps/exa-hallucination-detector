import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm/expressions';
import { submissions, Submission, NewSubmission } from '@/src/db/schema';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

export const db = drizzle(process.env.DATABASE_URL);

// Function to save a new submission
export async function saveSubmission(newSubmission: NewSubmission): Promise<Submission> {
    const insertedSubmissions = await db.insert(submissions).values(newSubmission).returning();
    return insertedSubmissions[0];
}

// Function to get a submission by ID
export async function getSubmissionById(id: string): Promise<Submission | null> {
    const submissionsList = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, id));
    return submissionsList[0] || null;
}

// Function to update a submission with claims
export async function saveClaims(id: string, claims: any[]): Promise<void> {
    await db.update(submissions).set({ claims }).where(eq(submissions.id, id));
}