"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 — Tabs / Segmented Control
 * 2px bottom border in --primary for active tab;
 * segmented control uses --surface-muted track with white pill.
 */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-surface-muted text-text-muted inline-flex min-h-[44px] w-fit items-center justify-start rounded-md border border-border p-1 gap-1",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-surface data-[state=active]:text-text data-[state=active]:border-border data-[state=active]:font-semibold border border-transparent text-text-muted hover:text-text inline-flex min-h-[34px] flex-1 items-center justify-center gap-2 rounded-sm px-3.5 py-1.5 text-[14px] font-medium whitespace-nowrap transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
