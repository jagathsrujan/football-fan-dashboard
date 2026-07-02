"use client";

import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (session && !isPending) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  async function handleGitHubSignIn() {
    await signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      {/* Pitch-pattern background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          )`,
        }}
        aria-hidden="true"
      />

      <Card className="relative z-10 w-full max-w-sm text-center">
        {/* App mark */}
        <div className="mb-4 flex flex-col items-center gap-2">
          <span className="text-4xl" role="img" aria-label="Football">
            ⚽
          </span>
          <span className="font-display text-2xl font-bold tracking-tight">
            FanDash
          </span>
        </div>

        <CardTitle className="mb-2 text-lg">Welcome to FanDash</CardTitle>
        <p className="mb-6 text-sm text-secondary">
          Sign in to favorite teams and players, get personalized match
          updates, and make the dashboard yours.
        </p>

        <Button
          onClick={handleGitHubSignIn}
          className="w-full gap-2"
          loading={isPending}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </Button>

        <p className="mt-4 text-xs text-muted">
          No password needed — GitHub handles authentication securely.
        </p>
      </Card>
    </div>
  );
}
