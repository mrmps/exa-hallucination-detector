import { z } from "zod";
import FactChecker from "@/components/dashboard/fact-checker";
import { getSubmissionById } from "@/src/index";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const searchParamsSchema = z.object({
    id: z.string().optional(),
  });
  const parseResult = searchParamsSchema.safeParse(searchParams);

  if (!parseResult.success) {
    return (
      <div>
        <h1>No Submission ID Provided</h1>
        <p>Please submit your text first.</p>
      </div>
    );
  }

  const { id } = parseResult.data;
  
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

  if (typeof submission.content !== 'string') {
    return (
      <div>
        <h1>Invalid Submission Data</h1>
        <p>The submission data is incomplete or malformed.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col items-center overflow-hidden">
      <FactChecker
        submissionId={id}
        text={submission.content}
      />
    </div>
  );
}
