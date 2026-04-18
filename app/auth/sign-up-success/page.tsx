import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground mt-2">
            We&apos;ve sent you a confirmation link. Click it to activate your account.
          </p>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">Back to sign in</Link>
        </Button>
      </div>
    </main>
  )
}
