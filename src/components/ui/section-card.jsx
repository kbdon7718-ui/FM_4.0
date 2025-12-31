import * as React from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "./card.jsx";
import { cn } from "./utils.js";

function SectionCard({ className, ...props }) {
  return <Card className={cn("shadow-sm", className)} {...props} />;
}

function SectionCardHeader({ title, description, action, className }) {
  if (!title && !description && !action) return null;

  return (
    <CardHeader
      className={cn(
        "relative overflow-hidden border-b border-border bg-muted/10",
        "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-primary/60 after:via-sidebar-primary/30 after:to-transparent",
        className,
      )}
    >
      <div className="min-w-0">
        {title ? (
          <CardTitle className="truncate flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>{title}</span>
          </CardTitle>
        ) : null}
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
      {action ? <CardAction>{action}</CardAction> : null}
    </CardHeader>
  );
}

function SectionCardContent({ className, ...props }) {
  return <CardContent className={cn(className)} {...props} />;
}

export { SectionCard, SectionCardHeader, SectionCardContent };
