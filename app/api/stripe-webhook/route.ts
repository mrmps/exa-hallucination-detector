import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Map your Price IDs to the number of credits to add
const priceToCreditsMap: Record<string, number> = {
  "price_1QWPITPvVlQ90xYWcl4Jf0z5": 20000,
};

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (!session.metadata?.userId) {
        return NextResponse.json({ received: true });
      }

      console.log('session', session.metadata.userId);

      try {
        await clerkClient().then(client => 
          client.users.updateUserMetadata(session.metadata!.userId, {
            publicMetadata: {
              stripeCustomerId: session.customer?.toString(),
              credits: 20000
            }
          })
        );

        console.log(`Payment successful for session ID: ${session.id}`);
        return NextResponse.json({ received: true });
      } catch (error) {
        console.error('Failed to update user metadata:', error);
        return NextResponse.json(
          { received: true, error: 'Failed to update user metadata' },
          { status: 500 }
        );
      }
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
      return NextResponse.json({ received: true });
  }
}
