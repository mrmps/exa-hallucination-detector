// app/dashboard/page.tsx
import { getSubmissionById } from '@/src/index';
import FactChecker from '@/components/dashboard/fact-checker'; // Adjust the import path
import { FactCheckerProps } from '@/lib/types';
import Demo from '@/components/dashboard/demo';

export default async function DashboardPage({ searchParams }: { searchParams: { id?: string } }) {
  const id = searchParams.id;

  if (!id) {
    return (
      <div>
        <h1>No Submission ID Provided</h1>
        <p>Please submit your text first.</p>
      </div>
    );
  }

  const submission = await getSubmissionById(id);

  if (!submission) {
    return (
      <div>
        <h1>Submission Not Found</h1>
        <p>The submission with the provided ID does not exist.</p>
      </div>
    );
  }

  // Prepare the initial data for FactChecker
  const factCheckerProps: FactCheckerProps = {
    sentences: submission.sentences.map((text: string, index: number) => ({
      id: index + 1,
      text,
    })),
    scansLeft: 0, // Adjust based on your logic
    totalScans: 0, // Adjust based on your logic
    issuesCount: 0, // Will be updated later
    claimsCount: 0, // Will be updated later
    claims: [], // Will be fetched on the client side
  };

  return (
    <div className="flex h-[100dvh] flex-col items-center overflow-hidden">
      <Demo {...factCheckerProps} submissionId={id} />
    </div>
  );
}
