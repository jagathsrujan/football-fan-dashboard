import { User } from "lucide-react";
import { FeedbackStates, PageHeader } from "@/components/mock/page-sections";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div>
      <PageHeader eyebrow="Phase 4 preview" title="Sign in" />
      <Card className="mx-auto max-w-md text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded bg-floodlight font-display text-xl font-bold text-base">
          FD
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">Save your favorite teams</h2>
        <p className="mt-2 text-sm text-secondary">GitHub OAuth is wired in Phase 4. This is a mock shell preview.</p>
        <Button className="mt-5 w-full" variant="primary">
          <User size={18} strokeWidth={1.75} />
          Continue with GitHub
        </Button>
      </Card>
      <FeedbackStates emptyMessage="No authenticated session exists in the mock shell." />
    </div>
  );
}
