import { redirect } from "next/navigation";

export default function HomeLaunchPage() {
  // Keep the install manifest on a stable /home entry point while preserving
  // the existing authenticated resident routing and Supabase session cookies.
  redirect("/");
}
