import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_EMAIL, DEMO_PASSWORD, ensureDemoSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  await ensureDemoSeed();

  return (
    <AuthShell>
      <AuthForm mode="login" demoEmail={DEMO_EMAIL} demoPassword={DEMO_PASSWORD} />
    </AuthShell>
  );
}
