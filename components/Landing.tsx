// app/components/LandingPage.tsx
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
];

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
];

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
  );
}