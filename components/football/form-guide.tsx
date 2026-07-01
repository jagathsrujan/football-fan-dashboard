import { Badge } from "@/components/ui/badge";

type FormGuideProps = { results: readonly ("W" | "D" | "L")[] };

export function FormGuide({ results }: FormGuideProps) {
  return (
    <div className="flex gap-1" aria-label={`Form ${results.join(" ")}`}>
      {results.slice(0, 5).map((result, index) => (
        <Badge key={`${result}-${index}`} variant={result === "W" ? "win" : result === "D" ? "draw" : "loss"} className="h-7 w-7 justify-center px-0">
          {result}
        </Badge>
      ))}
    </div>
  );
}
