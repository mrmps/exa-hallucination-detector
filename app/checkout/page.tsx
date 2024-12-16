import Link from "next/link"
import { currentUser } from '@clerk/nextjs/server'
import { retrieveStripeCheckoutSession } from "@/lib/actions" 

interface CheckoutPageProps {
  searchParams: {
    sessionId?: string
  }
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const sessionId = searchParams.sessionId

  // If we have a sessionId, attempt to retrieve the session and update user data
  if (sessionId) {
    await retrieveStripeCheckoutSession(sessionId)
  }

  const user = await currentUser()
  const credits = user?.publicMetadata?.credits as number | undefined

  return (
    <section className="py-24 min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Thank You!
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Your payment has been successfully processed and your credits have been added to your account.
        </p>
        {typeof credits === "number" && (
          <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 mb-8">
            <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
              Current Balance: {credits.toLocaleString()} credits
            </p>
          </div>
        )}
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 w-full"
        >
          Return to Dashboard
        </Link>
      </div>
    </section>
  )
}
