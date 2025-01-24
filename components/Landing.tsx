"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileCheck, 
  Search, 
  Database, 
  CheckCircle, 
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import FactCheckTool from "./textarea-landing";
import { Hero } from './modern-hero';
import ButtonCTA from "./ButtonCTA";

const howItWorks = [
  {
    title: "Submit AI-Generated Content",
    description: "Paste any LLM-produced text to identify potential hallucinations and inaccuracies",
    icon: FileCheck,
  },
  {
    title: "Deep Truth Analysis",
    description: "Our system cross-references claims against the entire web in real-time",
    icon: Search,
  },
  {
    title: "Get Verified Insights",
    description: "Receive line-by-line accuracy ratings with source citations and correction suggestions",
    icon: Database,
  },
];

const benefits = [
  {
    title: "Eliminate AI Hallucinations",
    description: "Automatically flag unverified claims before they damage your credibility",
    icon: FileCheck,
  },
  {
    title: "Fact-Check at Scale", 
    description: "Process 10,000 words in seconds - perfect for long-form AI content verification",
    icon: CheckCircle,
  },
  {
    title: "Source-Based Corrections",
    description: "Get evidence-backed rewriting suggestions for any questionable claims",
    icon: ExternalLink,
  },
];

const testimonials = [
  {
    quote: "Cut our LLM hallucination rate by 92% while maintaining output volume. Essential for any AI content workflow.",
    name: "Sarah Johnson",
    title: "AI Content Lead at TechDaily"
  },
  {
    quote: "Finally a solution that lets us scale AI content responsibly. The source citations alone are worth it.",
    name: "Michael Chen", 
    title: "Head of AI Operations"
  },
  {
    quote: "Our fact-checking team now focuses on high-value work instead of chasing false claims.",
    name: "Emily Rodriguez",
    title: "Content Integrity Director"
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background pattern */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808002_1px,transparent_1px),linear-gradient(to_bottom,#80808002_1px,transparent_1px)] bg-[size:14px_24px]"
        style={{
          mask: 'radial-gradient(circle at center, white 60%, transparent 100%)',
          WebkitMask: 'radial-gradient(circle at center, white 60%, transparent 100%)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E")`,
        }}
      />

      <Hero
        title="Stop AI Hallucinations in Their Tracks"
        description="Verify every claim in your AI-generated content against trusted sources. Prevent misinformation and maintain credibility with real-time fact validation."
        buttonText="Start Fact-Checking"
        avatars={[
          { src: "/avatars/avatar-1.png", alt: "User avatar 1" },
          { src: "/avatars/avatar-2.png", alt: "User avatar 2" },
          { src: "/avatars/avatar-3.png", alt: "User avatar 3" },
        ]}
        rating={{
          value: 5,
          count: 142
        }}
        className="py-16 mt-10"
      />

      {/* Fact Check Tool */}
      <div className="mt-10">
        <FactCheckTool />
      </div>

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
          <h2 className="text-3xl font-semibold text-neutral-900 tracking-tight">Truth Validation Engine</h2>
          <p className="text-neutral-600 max-w-xl mx-auto [text-wrap:balance] leading-relaxed">
            Our three-step process identifies and corrects LLM hallucinations before they reach your audience
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
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900 tracking-tight">AI Content Guardrails</h2>
          <p className="text-neutral-600 mb-6 [text-wrap:balance] leading-relaxed">
            Get started now with a free trial—no credit card required, no commitments.
          </p>
          <ButtonCTA />
          <p className="mt-4 text-sm text-neutral-500">Includes plagiarism detection • Source citations • Compliance reporting</p>
        </Card>
      </div>
    </div>
  );
}