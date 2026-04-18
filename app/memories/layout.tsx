import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"

export default async function MemoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/memories" className="text-xl font-semibold tracking-tight">
            ReLive
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/memories/new">
              <Button size="sm">New Memory</Button>
            </Link>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
