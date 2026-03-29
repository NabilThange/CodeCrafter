import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function HomePage() {
  // If a userId cookie exists, check whether they have a portfolio
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    // No session — go to onboarding (auth is shared with main platform)
    redirect("/onboarding");
  }

  // Try to detect portfolio existence via API
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/kuberaa/portfolio`, {
      headers: { Cookie: `userId=${userId}` },
      cache: "no-store",
    });
    const data = await res.json();
    if (data?.id) {
      redirect("/dashboard");
    } else {
      redirect("/onboarding");
    }
  } catch {
    redirect("/onboarding");
  }
}
