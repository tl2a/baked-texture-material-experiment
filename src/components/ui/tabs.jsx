"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "../../lib/utils";

function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "flex w-full items-center bg-slate-900/50 p-0.5 rounded-lg mb-2 gap-0.5 justify-center",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "flex-1 flex items-center justify-center rounded-md py-1.5 m-0.5 text-xs font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-indigo-400",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
