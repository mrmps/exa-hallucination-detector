"use client";

import * as React from "react";
import { X, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose, DrawerTrigger } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { loadStripe } from "@stripe/stripe-js";
import useMediaQuery from "@/lib/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";
import { createStripeCheckoutSession } from "@/lib/actions";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function UpgradeModal() {
  const [open, setOpen] = React.useState(false);
  const [plans, setPlans] = React.useState<any[]>([]);
  const [plan, setPlan] = React.useState("annual");
  const { isMobile } = useMediaQuery();
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };
    fetchPlans();
  }, []);

  const handleBuy = async (priceId: string) => {
    try {
      const { sessionId } = await createStripeCheckoutSession([{
        price: priceId,
        quantity: 1
      }]);
      const stripe = await stripePromise;
      if (!stripe || !sessionId) {
        throw new Error("Stripe or sessionId not available");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Something went wrong with the subscription!"
      });
    }
  };

  const content = (
    <div className="px-4 py-2 space-y-4">
      <p className="text-sm text-muted-foreground">
        Instantly verify claims, boost credibility, and excel in your writing with our AI-powered fact-checker.
      </p>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Premium Plan Includes:</h3>
        <ul className="text-sm space-y-1">
          <li><Check className="inline h-4 w-4 text-blue-500 mr-1" /> 20,000 monthly fact checks</li>
          <li><Check className="inline h-4 w-4 text-blue-500 mr-1" /> Advanced claim verification</li>
          <li><Check className="inline h-4 w-4 text-blue-500 mr-1" /> Credibility analysis</li>
          <li><Check className="inline h-4 w-4 text-blue-500 mr-1" /> Citation suggestions</li>
        </ul>
      </div>

      <div className="bg-gray-50 border rounded-lg p-3 text-sm italic text-muted-foreground">
        "I rely on this for every research paper—it's saved me countless hours and made my work more credible."
        <div className="mt-1 font-medium text-black">— Sarah, Researcher</div>
      </div>

      <RadioGroup value={plan} onValueChange={setPlan} className="space-y-2">
        {plans.map((planOption) => (
          <div key={planOption.id} className={`flex items-center space-x-2 rounded-md border p-3 ${plan === planOption.id ? 'border-blue-500 bg-blue-50' : ''}`}>
            <RadioGroupItem value={planOption.id} id={planOption.id} className="w-5 h-5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 checked:border-blue-500 checked:bg-blue-500" />
            <div className="flex-1">
              <Label htmlFor={planOption.id} className="text-sm font-medium flex items-center">
                {planOption.name}
                {planOption.interval === 'year' && <Badge className="ml-1 text-[10px] py-0 px-1">SAVE 25%</Badge>}
              </Label>
              <div className="text-xs text-muted-foreground">${(planOption.price / 100).toFixed(2)} / {planOption.interval}</div>
              <div className="text-xs text-muted-foreground">20,000 credits/month</div>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline">Upgrade to Premium</Button>
        </DrawerTrigger>
        <DrawerContent className="fixed inset-x-0 bottom-0 mt-24 rounded-t-[10px] max-h-[96vh]">
          <div className="max-w-md mx-auto h-full overflow-y-auto">
            <DrawerHeader className="text-left p-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  PREMIUM
                </Badge>
                <DrawerClose className="rounded-full opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DrawerClose>
              </div>
              <DrawerTitle className="text-xl font-bold tracking-tight">
                Elevate Your Writing with Verified Facts
              </DrawerTitle>
            </DrawerHeader>
            {content}
            <DrawerFooter className="px-4 py-4">
              <Button 
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  const selectedPlan = plans.find(p => p.id === plan);
                  if (selectedPlan) {
                    handleBuy(selectedPlan.price_id);
                  }
                }}
              >
                Upgrade to Premium
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Upgrade to Premium</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left p-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
              PREMIUM
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Elevate Your Writing with Verified Facts
          </DialogTitle>
        </DialogHeader>
        {content}
        <div className="p-4 mt-4">
          <Button 
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              const selectedPlan = plans.find(p => p.id === plan);
              if (selectedPlan) {
                handleBuy(selectedPlan.price_id);
              }
            }}
          >
            Upgrade to Premium
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
