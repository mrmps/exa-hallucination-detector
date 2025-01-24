"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

interface SubscriptionStatus {
  isPaying: boolean;
  credits: number;
  isLoading: boolean;
  error: string | null;
}

export function useSubscriptionStatus(): SubscriptionStatus {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isPaying: false,
    credits: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      setStatus(prev => ({
        ...prev,
        isLoading: false
      }));
      return;
    }

    // Get credits directly from user metadata
    const credits = (user.publicMetadata?.credits as number) || 0;
    const stripeCustomerId = user.publicMetadata?.stripeCustomerId;

    setStatus({
      isPaying: !!stripeCustomerId,
      credits: credits,
      isLoading: false,
      error: null
    });

  }, [isLoaded, isSignedIn, user]);

  return status;
}


