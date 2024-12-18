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

  const initialSentences = submission.sentences.map((text: string, index: number) => ({
    id: index + 1,
    text
  }));

  return (
    <div className="flex h-[100dvh] flex-col items-center overflow-hidden">
      <FactChecker submissionId={id} sentences={initialSentences} text={submission.content} />
    </div>
  );
}

// import { getSubmissionById } from "@/src/index";
// import FactChecker from "@/components/dashboard/fact-checker";
// import { FactCheckerProps, Claim, Sentence } from "@/lib/types";
// import { z } from "zod";
// import * as Schemas from "@/lib/schemas";

// export default async function DashboardPage({
//   searchParams,
// }: {
//   searchParams: { id?: string };
// }) {
//   const searchParamsSchema = z.object({
//     id: z.string().optional(),
//   });
//   const parseResult = searchParamsSchema.safeParse(searchParams);

//   if (!parseResult.success) {
//     return (
//       <div>
//         <h1>No Submission ID Provided</h1>
//         <p>Please submit your text first.</p>
//       </div>
//     );
//   }

//   const { id } = parseResult.data;
//   try {
//     if (!id) {
//       return (
//         <div>
//           <h1>No Submission ID Provided</h1>
//           <p>Please submit your text first.</p>
//         </div>
//       );
//     }

//     const submission = await getSubmissionById(id);

//     if (!submission) {
//       return (
//         <div>
//           <h1>Submission Not Found</h1>
//           <p>The submission with the provided ID does not exist.</p>
//         </div>
//       );
//     }

//     const sentences: Sentence[] = submission.sentences.map(
//       (text: string, index: number) => ({
//         id: index + 1,
//         text,
//       })
//     );

//     const baseUrl = process.env.VERCEL_URL
//       ? `https://${process.env.VERCEL_URL}`
//       : process.env.NEXT_PUBLIC_APP_URL;

//     const extractResponse = await fetch(`${baseUrl}/api/extractclaims`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ sentences: sentences.map((s) => s.text) }),
//     });

//     if (!extractResponse.ok) {
//       throw new Error(
//         `Failed to extract claims: ${extractResponse.statusText}`
//       );
//     }

//     const extractedData = await extractResponse.json();
//     const { claims: extractedClaims } =
//       Schemas.ExtractClaimsResponseSchema.parse(extractedData);

//     const claims: Claim[] = [];

//     for (const extractedClaim of extractedClaims) {
//       try {
//         const exaResponse = await fetch(`${baseUrl}/api/exasearch`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ claim: extractedClaim.text }),
//         });

//         if (!exaResponse.ok) {
//           throw new Error(`ExaSearch failed: ${exaResponse.statusText}`);
//         }

//         const exaData = await exaResponse.json();
//         const { results: exaResults } =
//           Schemas.ExaSearchResponseSchema.parse(exaData);

//         if (exaResults.length === 0) {
//           continue;
//         }

//         const verifyResponse = await fetch(`${baseUrl}/api/verifyclaims`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             claim: extractedClaim.text,
//             sentenceIds: extractedClaim.sentenceIds,
//             sources: exaResults,
//           }),
//         });

//         if (!verifyResponse.ok) {
//           throw new Error(
//             `Claim verification failed: ${verifyResponse.statusText}`
//           );
//         }

//         const verifiedData = await verifyResponse.json();
//         const { claim: verifiedClaim } =
//           Schemas.VerifiedClaimResponseSchema.parse(verifiedData);

//         claims.push(verifiedClaim);
//       } catch (error) {
//         console.error(`Error processing claim: ${extractedClaim.text}`, error);
//       }
//     }

//     const issuesCount = claims.filter(
//       (claim) => claim.status === "contradicted"
//     ).length;

//     const factCheckerProps: FactCheckerProps = {
//       sentences,
//       scansLeft: 3,
//       totalScans: 5,
//       issuesCount,
//       claimsCount: claims.length,
//       claims,
//       submissionId: id,
//     };

//     return (
//       <div className="flex h-[100dvh] flex-col items-center overflow-hidden">
//         <FactChecker {...factCheckerProps} />
//       </div>
//     );
//   } catch (error) {
//     console.error("Error in DashboardPage:", error);
//     const errorMessage =
//       error instanceof z.ZodError
//         ? "Invalid data format"
//         : error instanceof Error
//         ? error.message
//         : "Unknown error";
//     return (
//       <div>
//         <h1>Error Processing Submission</h1>
//         <p>
//           An error occurred while processing your submission. Please try again
//           later.
//         </p>
//         <p className="text-sm text-gray-500">{errorMessage}</p>
//       </div>
//     );
//   }
// }
