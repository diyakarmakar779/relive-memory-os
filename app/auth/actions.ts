"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  redirect("/memories")
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  const supabase = await createClient()
  
  const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
    `${process.env.NEXT_PUBLIC_SITE_URL || ""}/auth/callback`
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
    },
  })
  
  if (error) {
    return { error: error.message }
  }
  
  redirect("/auth/sign-up-success")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
