import { Badge } from "@/components/ui/badge";
import { Bot, CircleAlert, Database, Sparkles } from "lucide-react";
import { EnvironmentBadgeProps } from "../interface";

export function EnvironmentBadge({ status, isLoading }: EnvironmentBadgeProps) {
  if (isLoading) {
    return (
      <Badge variant="outline" className="h-7 bg-muted/60 text-muted-foreground">
        Memeriksa AI
      </Badge>
    );
  }

  if (!status) {
    return (
      <Badge variant="outline" className="h-7 bg-red-50 text-red-700 border-red-200">
        <CircleAlert className="h-3 w-3" />
        Offline
      </Badge>
    );
  }

  if (status.isMock || status.provider === "mock") {
    return (
      <Badge variant="outline" className="h-7 bg-amber-50 text-amber-700 border-amber-200">
        <Sparkles className="h-3 w-3" />
        Demo Mock
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="h-7 bg-emerald-50 text-emerald-700 border-emerald-200">
      {status.database === "ok" ? (
        <Database className="h-3 w-3" />
      ) : (
        <Bot className="h-3 w-3" />
      )}
      {status.provider || "AI"}
    </Badge>
  );
}
