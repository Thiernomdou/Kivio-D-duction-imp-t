"use client";

import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="relative min-h-[60vh]">
      {/* Background effects (same as dashboard) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-cyan/5 rounded-full blur-[120px]" />
      </div>

      {/* Skeleton content */}
      <div className="relative z-10">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
