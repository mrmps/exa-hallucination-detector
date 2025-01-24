"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useSubscriptionStatus } from "@/lib/hooks/use-subscription";
import { Button } from "@/components/ui/button";

export default function CTAButton() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isPaying, isLoading: isSubLoading } = useSubscriptionStatus();
  const router = useRouter();

  const handleClick = () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-up");
    } else if (!isPaying) {
      router.push("/?upgrade=true");
    } else {
      router.push("/dashboard");
    }
  };

  const getButtonText = () => {
    if (!isLoaded || isSubLoading) return "Loading...";
    if (!isSignedIn) return "Get Started Free";
    if (!isPaying) return "Upgrade to Premium";
    return "Go to Dashboard";
  };

  return (
    <Button 
      onClick={handleClick}
      className="px-8 h-12 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08),0_8px_16px_rgba(0,0,0,0.08)] active:translate-y-[1px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
    >
      {getButtonText()}
    </Button>
  );
}

