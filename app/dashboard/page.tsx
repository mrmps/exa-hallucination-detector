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

  if (!parseResult.success || !parseResult.data.id) {
    return (
      <div className="flex h-[100dvh] flex-col items-center overflow-hidden">
        <FactChecker
          submissionId=""
          text=""
        />
      </div>
    );
  }

  const { id } = parseResult.data;
  const submission = await getSubmissionById(id);

  if (!submission) {
    return (
      <div className="flex h-[100dvh] flex-col items-center overflow-hidden">
        <FactChecker
          submissionId=""
          text=""
        />
      </div>
    );
  }

  if (typeof submission.content !== 'string') {
    return (
      <div className="flex h-[100dvh] flex-col items-center overflow-hidden">
        <FactChecker
          submissionId=""
          text=""
        />
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
