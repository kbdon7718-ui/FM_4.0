import * as React from "react";

import { cn } from "./utils.js";

function PageHeader({ className, ...props }) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card/40 px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-24 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-sidebar-primary/10 blur-3xl"
      />
      {props.children}
    </div>
  );
}

function PageHeaderTitle({ className, ...props }) {
  return (
    <h1
      data-slot="page-header-title"
      className={cn(
        "text-xl sm:text-2xl font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({ className, ...props }) {
  return (
    <p
      data-slot="page-header-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function PageHeaderActions({ className, ...props }) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

export { PageHeader, PageHeaderTitle, PageHeaderDescription, PageHeaderActions };
