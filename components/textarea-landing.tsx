// app/components/FactCheckTool.tsx
"use client";

import * as React from "react";
import { useState, FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FactCheckTool() {
  const router = useRouter();
  const [articleContent, setArticleContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!articleContent) {
      setError("Please enter some content or try with sample blog.");
      return;
    }

    if (articleContent.length < 50) {
      setError("Too short. Please enter at least 50 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: articleContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      router.push(`/dashboard?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit content");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleBlog = `The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was originally built as a giant sundial in 1822, intended to cast shadows across the city to mark the hours. Designed by the renowned architect Gustave Eiffel, the tower stands 324 meters tall and once housed the city's first observatory.\n\nWhile it's famously known for hosting over 7 million visitors annually, it was initially disliked by Parisians. Interestingly, the Eiffel Tower was used as to guide ships along the Seine during cloudy nights.`;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="overflow-hidden border-neutral-200/70 bg-white/70 backdrop-blur-sm shadow-[0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_0_1px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.08)]">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5">
            <Textarea
              ref={textareaRef}
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
              placeholder="Paste your content here..."
              className="min-h-[200px] resize-none border-0 bg-transparent p-0 text-[15px] leading-relaxed placeholder:text-neutral-400 focus-visible:ring-0 transition-all duration-200 ease-in-out focus:scale-[1.01]"
            />
          </div>
          <div className="flex items-center justify-between border-t border-neutral-200/70 bg-neutral-50/50 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setArticleContent(sampleBlog)}
              className="text-[13px] font-normal text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200"
              disabled={isSubmitting}
            >
              Try a sample
            </Button>
            <Button
              type="submit"
              className="relative overflow-hidden bg-neutral-900 px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-neutral-800 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08),0_8px_16px_rgba(0,0,0,0.08)] active:translate-y-[1px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Verify Now"}
              <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <div className="mt-8">
          <Card className="border-red-200 bg-red-50/50 p-4 text-red-700">
            {error}
          </Card>
        </div>
      )}
    </div>
  );
}

// // app/components/FactCheckTool.tsx
// "use client";

// import * as React from "react";
// import { useState, FormEvent, useRef, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Textarea } from "@/components/ui/textarea";
// import { ArrowRight } from 'lucide-react';
// import ClaimsListResults from "./dashboard/ClaimsListResult";
// import LoadingMessages from "./ui/LoadingMessages";
// import PreviewBox from "./PreviewBox";
// import ShareButtons from "./ui/ShareButtons";

// interface Claim {
//   claim: string;
//   original_text: string;
// }

// type FactCheckResponse = {
//   claim: string;
//   assessment: "True" | "False" | "Insufficient Information";
//   summary: string;
//   fixed_original_text: string;
//   confidence_score: number;
// };

// export default function FactCheckTool() {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [factCheckResults, setFactCheckResults] = useState<any[]>([]);
//   const [articleContent, setArticleContent] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [showAllClaims, setShowAllClaims] = useState(true);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const loadingRef = useRef<HTMLDivElement>(null);

//   const scrollToLoading = () => {
//     loadingRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     if (isGenerating) {
//       scrollToLoading();
//     }
//   }, [isGenerating]);

//   const extractClaims = async (content: string) => {
//     const response = await fetch('/api/extractclaims', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ content }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Failed to extract claims.');
//     }

//     const data = await response.json();
//     return Array.isArray(data.claims) ? data.claims : JSON.parse(data.claims);
//   };

//   const exaSearch = async (claim: string) => {
//     const response = await fetch('/api/exasearch', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ claim }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Failed to fetch verification for claim.');
//     }

//     return await response.json();
//   };

//   const verifyClaim = async (claim: string, original_text: string, exasources: any) => {
//     const response = await fetch('/api/verifyclaims', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ claim, original_text, exasources }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Failed to verify claim.');
//     }

//     const data = await response.json();
//     return data.claims as FactCheckResponse;
//   };

//   const factCheck = async (e: FormEvent) => {
//     e.preventDefault();

//     if (!articleContent) {
//       setError("Please enter some content or try with sample blog.");
//       return;
//     }

//     if (articleContent.length < 50) {
//       setError("Too short. Please enter at least 50 characters.");
//       return;
//     }

//     setIsGenerating(true);
//     setError(null);
//     setFactCheckResults([]);

//     try {
//       const claims = await extractClaims(articleContent);
//       const finalResults = await Promise.all(
//         claims.map(async ({ claim, original_text }: Claim) => {
//           try {
//             const exaSources = await exaSearch(claim);

//             if (!exaSources?.results?.length) {
//               return null;
//             }

//             const sourceUrls = exaSources.results.map((result: { url: any; }) => result.url);
//             const verifiedClaim = await verifyClaim(claim, original_text, exaSources.results);

//             return { ...verifiedClaim, original_text, url_sources: sourceUrls };
//           } catch (error) {
//             console.error(`Failed to verify claim: ${claim}`, error);
//             return null;
//           }
//         })
//       );

//       setFactCheckResults(finalResults.filter(result => result !== null));
//     } catch (error) {
//       setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
//       setFactCheckResults([]);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const sampleBlog = `The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was originally built as a giant sundial in 1822, intended to cast shadows across the city to mark the hours. Designed by the renowned architect Gustave Eiffel, the tower stands 324 meters tall and once housed the city's first observatory.\n\nWhile it's famously known for hosting over 7 million visitors annually, it was initially disliked by Parisians. Interestingly, the Eiffel Tower was used as to guide ships along the Seine during cloudy nights.`;

//   return (
//     <div className="max-w-3xl mx-auto">
//       <Card className="overflow-hidden border-neutral-200/70 bg-white/70 backdrop-blur-sm shadow-[0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_0_1px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.08)]">
//         <form onSubmit={factCheck}>
//           <div className="px-6 py-5">
//             <Textarea
//               ref={textareaRef}
//               value={articleContent}
//               onChange={(e) => setArticleContent(e.target.value)}
//               placeholder="Paste your content here..."
//               className="min-h-[200px] resize-none border-0 bg-transparent p-0 text-[15px] leading-relaxed placeholder:text-neutral-400 focus-visible:ring-0 transition-all duration-200 ease-in-out focus:scale-[1.01]"
//             />
//           </div>
//           <div className="flex items-center justify-between border-t border-neutral-200/70 bg-neutral-50/50 px-6 py-4">
//             <Button
//               type="button"
//               variant="ghost"
//               onClick={() => setArticleContent(sampleBlog)}
//               disabled={isGenerating}
//               className="text-[13px] font-normal text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200"
//             >
//               Try a sample
//             </Button>
//             <Button
//               type="submit"
//               disabled={isGenerating}
//               className="relative overflow-hidden bg-neutral-900 px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-neutral-800 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08),0_8px_16px_rgba(0,0,0,0.08)] active:translate-y-[1px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
//             >
//               {isGenerating ? 'Detecting Hallucinations...' : 'Verify Now'}
//               <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
//             </Button>
//           </div>
//         </form>
//       </Card>

//       {isGenerating && (
//         <div ref={loadingRef} className="w-full mt-8">
//           <LoadingMessages isGenerating={isGenerating} />
//         </div>
//       )}

//       {error && (
//         <div className="mt-8">
//           <Card className="border-red-200 bg-red-50/50 p-4 text-red-700">
//             {error}
//           </Card>
//         </div>
//       )}

//       {factCheckResults.length > 0 && (
//         <div className="mt-16 space-y-14">
//           <PreviewBox
//             content={articleContent}
//             claims={factCheckResults}
//           />

//           <div className="mt-4 pt-12">
//             <Button
//               variant="ghost"
//               onClick={() => setShowAllClaims(!showAllClaims)}
//               className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900"
//             >
//               {showAllClaims ? "Hide Claims" : "Show All Claims"}
//             </Button>

//             {showAllClaims && (
//               <div className="mt-4">
//                 <ClaimsListResults results={factCheckResults} />
//               </div>
//             )}
//           </div>

//           <ShareButtons />
//         </div>
//       )}
//     </div>
//   );
// }
