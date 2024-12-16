"use client";

import * as React from "react";
import { useState, FormEvent, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  FileCheck, 
  Search, 
  Database, 
  ExternalLink 
} from 'lucide-react';

import ClaimsListResults from "./ClaimsListResult";
import LoadingMessages from "./ui/LoadingMessages";
import PreviewBox from "./PreviewBox";
import AnimatedGradientText from "./ui/animated-gradient-text";
import ShareButtons from "./ui/ShareButtons";

interface Claim {
  claim: string;
  original_text: string;
}

type FactCheckResponse = {
  claim: string;
  assessment: "True" | "False" | "Insufficient Information";
  summary: string;
  fixed_original_text: string;
  confidence_score: number;
};

export default function FactFilter() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [factCheckResults, setFactCheckResults] = useState<any[]>([]);
  const [articleContent, setArticleContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAllClaims, setShowAllClaims] = useState(true);
  const loadingRef = useRef<HTMLDivElement>(null);

  const scrollToLoading = () => {
    loadingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isGenerating) {
      scrollToLoading();
    }
  }, [isGenerating]);

  const extractClaims = async (content: string) => {
    const response = await fetch('/api/extractclaims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract claims.');
    }
  
    const data = await response.json();
    return Array.isArray(data.claims) ? data.claims : JSON.parse(data.claims);
  };

  const exaSearch = async (claim: string) => {
    const response = await fetch('/api/exasearch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch verification for claim.');
    }

    return await response.json();
  };

  const verifyClaim = async (claim: string, original_text: string, exasources: any) => {
    const response = await fetch('/api/verifyclaims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim, original_text, exasources }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to verify claim.');
    }

    const data = await response.json();
    return data.claims as FactCheckResponse;
  };

  const factCheck = async (e: FormEvent) => {
    e.preventDefault();
  
    if (!articleContent) {
      setError("Please enter some content or try with sample blog.");
      return;
    }

    if (articleContent.length < 50) {
      setError("Too short. Please enter at least 50 characters.");
      return;
    }
  
    setIsGenerating(true);
    setError(null);
    setFactCheckResults([]);
  
    try {
      const claims = await extractClaims(articleContent);
      const finalResults = await Promise.all(
        claims.map(async ({ claim, original_text }: Claim) => {
          try {
            const exaSources = await exaSearch(claim);
            
            if (!exaSources?.results?.length) {
              return null;
            }
    
            const sourceUrls = exaSources.results.map((result: { url: any; }) => result.url);
            const verifiedClaim = await verifyClaim(claim, original_text, exaSources.results);
    
            return { ...verifiedClaim, original_text, url_sources: sourceUrls };
          } catch (error) {
            console.error(`Failed to verify claim: ${claim}`, error);
            return null;
          }
        })
      );
  
      setFactCheckResults(finalResults.filter(result => result !== null));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
      setFactCheckResults([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const sampleBlog = `The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was originally built as a giant sundial in 1822, intended to cast shadows across the city to mark the hours. Designed by the renowned architect Gustave Eiffel, the tower stands 324 meters tall and once housed the city's first observatory.\n\nWhile it's famously known for hosting over 7 million visitors annually, it was initially disliked by Parisians. Interestingly, the Eiffel Tower was used as to guide ships along the Seine during cloudy nights.`;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ultra subtle background pattern with noise */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808002_1px,transparent_1px),linear-gradient(to_bottom,#80808002_1px,transparent_1px)] bg-[size:14px_24px]"
        style={{
          mask: 'radial-gradient(circle at center, white 60%, transparent 100%)',
          WebkitMask: 'radial-gradient(circle at center, white 60%, transparent 100%)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        {/* Hero Section */}
        <div className="text-center max-w-[640px] mx-auto">
          <div className="inline-flex items-center justify-center">
            <span className="inline-flex items-center rounded-full border border-neutral-200/70 bg-white px-3 py-1 text-sm text-neutral-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_3px_10px_rgba(0,0,0,0.04)] hover:border-neutral-300/70">
              🎉 <span className="mx-2 h-3 w-px bg-neutral-200" /> New AI-Powered Tool
            </span>
          </div>
          <h1 className="mt-6 text-[2.75rem] font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl [text-wrap:balance] [-webkit-text-stroke:1px_#000000] [text-shadow:0_4px_4px_rgba(0,0,0,0.05)]">
            Transform Your Text into Trustworthy Content
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 [text-wrap:balance]">
            Instantly verify facts and sources in your writing. No more guesswork—just credible, accurate content that builds trust with your audience.
          </p>
        </div>

        {/* Input Card (Hero Input) */}
        <div className="mt-10 max-w-3xl mx-auto">
          <Card className="overflow-hidden border-neutral-200/70 bg-white/70 backdrop-blur-sm shadow-[0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_0_1px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.08)]">
            <form onSubmit={factCheck}>
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
                  disabled={isGenerating}
                  className="text-[13px] font-normal text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200"
                >
                  Try a sample
                </Button>
                <Button 
                  type="submit"
                  disabled={isGenerating}
                  className="relative overflow-hidden bg-neutral-900 px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-neutral-800 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08),0_8px_16px_rgba(0,0,0,0.08)] active:translate-y-[1px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                >
                  {isGenerating ? 'Detecting Hallucinations...' : 'Verify Now'}
                  <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Show loading, error, and results below the input card */}
        {isGenerating && (
          <div ref={loadingRef} className="w-full mt-8">
            <LoadingMessages isGenerating={isGenerating} />
          </div>
        )}

        {error && (
          <div className="mt-8 max-w-3xl mx-auto">
            <Card className="border-red-200 bg-red-50/50 p-4 text-red-700">
              {error}
            </Card>
          </div>
        )}

        {factCheckResults.length > 0 && (
          <div className="mt-16 space-y-14 max-w-3xl mx-auto">
            <PreviewBox
              content={articleContent}
              claims={factCheckResults}
            />
            
            <div className="mt-4 pt-12">
              <Button
                variant="ghost"
                onClick={() => setShowAllClaims(!showAllClaims)}
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900"
              >
                {showAllClaims ? (
                  <>
                    <span>Hide Claims</span>
                  </>
                ) : (
                  <>
                    <span>Show All Claims</span>
                  </>
                )}
              </Button>

              {showAllClaims && (
                <div className="mt-4">
                  <ClaimsListResults results={factCheckResults} />
                </div>
              )}
            </div>
            
            <ShareButtons />
          </div>
        )}

        {/* Trust Signals */}
        <div className="mt-16 space-y-4 text-center">
          <p className="text-sm text-neutral-600">
            Trusted by writers, researchers, and professionals worldwide
          </p>
          <div className="flex justify-center gap-x-8 grayscale opacity-80">
            {['Vercel', 'Raycast', 'Linear', 'Mercury'].map((company) => (
              <div key={company} className="text-neutral-400 hover:opacity-75 transition-opacity duration-200">
                {company}
              </div>
            ))}
          </div>
        </div>

        {/* How It Works + Demo */}
        <div className="mt-32 max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-semibold text-neutral-900 tracking-tight">How It Works</h2>
            <p className="text-neutral-600 max-w-xl mx-auto [text-wrap:balance] leading-relaxed">
              FactFilter simplifies verification into a few easy steps—try it yourself and see instant results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative group">
                <div className="absolute -top-4 right-4 text-neutral-300 text-7xl font-bold">
                  {i + 1}
                </div>
                <Card className="relative h-full border-neutral-200/70 bg-white/70 p-6 shadow-[0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 transition-colors duration-300 group-hover:bg-neutral-200">
                    <step.icon className="h-6 w-6 text-neutral-600" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>

          {/* Inline Demo */}
          <Card className="mt-16 mx-auto max-w-2xl border-neutral-200/70 bg-white/70 shadow-[0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)] p-6 hover:shadow-[0_0_1px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-medium text-neutral-600">Live Example</p>
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  <span className="bg-green-100/50 px-1 py-0.5 rounded">"The Eiffel Tower is 324 meters tall."</span>
                  {' '}
                  <span className="bg-yellow-100/50 px-1 py-0.5 rounded">"It was built in 1887."</span>
                </p>
              </div>
              
              <div className="space-y-3 text-sm border-t border-neutral-200/70 pt-4">
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p><span className="font-medium text-neutral-900">Verified:</span> The Eiffel Tower is ~324 meters tall.</p>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="text-yellow-500 mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p><span className="font-medium text-neutral-900">Needs refinement:</span> Construction began in 1887 but completed in 1889.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-32">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-semibold text-neutral-900 tracking-tight">Key Benefits</h2>
            <p className="text-neutral-600 max-w-xl mx-auto [text-wrap:balance] leading-relaxed">
              Experience the power of AI-driven fact-checking that saves time and builds trust.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <Card 
                key={i} 
                className="relative border-neutral-200/70 bg-white/70 p-6 shadow-[0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 transition-colors duration-300 group-hover:bg-neutral-200">
                  <benefit.icon className="h-6 w-6 text-neutral-600" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-32 max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-semibold text-neutral-900 tracking-tight">Trusted by Industry Leaders</h2>
            <p className="text-neutral-600 max-w-xl mx-auto [text-wrap:balance] leading-relaxed">
              See why professionals choose FactFilter for their content verification needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="p-6 border-neutral-200/70 bg-white/70 shadow-[0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)]">
                <div className="mb-4">
                  <p className="text-neutral-600 text-sm leading-relaxed">{t.quote}</p>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full mr-3 flex items-center justify-center text-neutral-600 font-medium text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-neutral-900">{t.name}</p>
                    <p className="text-xs text-neutral-500">{t.title}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center max-w-2xl mx-auto">
          <Card className="border-neutral-200/70 bg-white/70 p-8 shadow-[0_0_1px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_0_1px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900 tracking-tight">Ready to Try FactFilter?</h2>
            <p className="text-neutral-600 mb-6 [text-wrap:balance] leading-relaxed">
              Get started now with a free trial—no credit card required, no commitments.
            </p>
            <Button 
              className="px-8 h-12 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08),0_8px_16px_rgba(0,0,0,0.08)] active:translate-y-[1px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
            >
              Start Your Free Trial
            </Button>
            <p className="mt-4 text-sm text-neutral-500">Get 5 free verifications • Upgrade anytime</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

const howItWorks = [
  {
    title: "Paste Your Text",
    description: "Drop in your article, essay, or claims that need verification.",
    icon: FileCheck,
  },
  {
    title: "AI Analysis",
    description: "Our AI identifies key facts and checks them against trusted sources.",
    icon: Search,
  },
  {
    title: "Get Results",
    description: "Review the verification report with confidence scores and sources.",
    icon: Database,
  },
]

const benefits = [
  {
    title: "Save Hours of Research",
    description: "Stop manually fact-checking. Let AI handle the heavy lifting while you focus on writing.",
    icon: FileCheck,
  },
  {
    title: "Build Trust & Credibility",
    description: "Every claim is verified against reliable sources, giving your content authority.",
    icon: CheckCircle,
  },
  {
    title: "Write with Confidence",
    description: "Know that your content is accurate before you publish, every single time.",
    icon: ExternalLink,
  },
]

const testimonials = [
  {
    quote: "FactFilter has transformed our editorial process. What used to take hours now takes minutes.",
    name: "Sarah Johnson",
    title: "Editor at TechDaily"
  },
  {
    quote: "The accuracy and speed of verification have made this an essential tool for our research team.",
    name: "Michael Chen",
    title: "Research Director"
  },
  {
    quote: "We've cut our fact-checking time by 80% while improving accuracy. It's a game-changer.",
    name: "Emily Rodriguez",
    title: "Content Strategy Lead"
  },
];
