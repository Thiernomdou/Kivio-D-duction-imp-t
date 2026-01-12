"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  animation?: "pulse" | "shimmer" | "none";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  animation = "shimmer",
  width,
  height,
}: SkeletonProps) {
  const baseClasses = "bg-white/5 rounded";

  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-2xl",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    shimmer: "skeleton-shimmer",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
}

// Skeleton pour une carte du dashboard
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white/[0.03] border border-white/10", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton variant="rectangular" className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-32 h-5 mb-2" />
          <Skeleton variant="text" className="w-24 h-4" />
        </div>
      </div>

      {/* Content */}
      <Skeleton variant="text" className="w-40 h-10 mb-6" />

      {/* Details */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton variant="text" className="w-24 h-4" />
          <Skeleton variant="text" className="w-20 h-4" />
        </div>
        <div className="flex justify-between">
          <Skeleton variant="text" className="w-28 h-4" />
          <Skeleton variant="text" className="w-16 h-4" />
        </div>
        <div className="flex justify-between">
          <Skeleton variant="text" className="w-20 h-4" />
          <Skeleton variant="text" className="w-24 h-4" />
        </div>
      </div>
    </div>
  );
}

// Skeleton pour la barre de progression
export function SkeletonProgressBar({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-[#0D0D0D] border border-white/10", className)}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="rectangular" className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl" />
        <div>
          <Skeleton variant="text" className="w-40 h-5 mb-1" />
          <Skeleton variant="text" className="w-24 h-3" />
        </div>
      </div>
      <Skeleton variant="rectangular" className="w-full h-10 sm:h-12 rounded-xl" />
    </div>
  );
}

// Skeleton pour l'upload zone
export function SkeletonUploadZone({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white/[0.03] border border-white/10", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="rectangular" className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-36 h-5 mb-2" />
          <Skeleton variant="text" className="w-48 h-4" />
        </div>
      </div>

      {/* Info box */}
      <Skeleton variant="rectangular" className="w-full h-12 rounded-lg mb-4" />

      {/* Upload zone */}
      <Skeleton variant="rectangular" className="w-full h-32 rounded-xl" />
    </div>
  );
}

// Skeleton pour le tableau des transferts
export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white/[0.03] border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton variant="rectangular" className="w-11 h-11 rounded-xl" />
        <div>
          <Skeleton variant="text" className="w-32 h-5 mb-2" />
          <Skeleton variant="text" className="w-24 h-4" />
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-4 gap-4 pb-3 border-b border-white/10 mb-4">
        <Skeleton variant="text" className="h-4 w-16" />
        <Skeleton variant="text" className="h-4 w-20" />
        <Skeleton variant="text" className="h-4 w-16" />
        <Skeleton variant="text" className="h-4 w-12" />
      </div>

      {/* Table rows */}
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            <Skeleton variant="text" className="h-5 w-20" />
            <Skeleton variant="text" className="h-5 w-24" />
            <Skeleton variant="text" className="h-5 w-16" />
            <Skeleton variant="text" className="h-5 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton complet pour le dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Alert banner skeleton */}
      <Skeleton variant="card" className="w-full h-24 rounded-xl sm:rounded-2xl" />

      {/* Two cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SkeletonCard />
        <SkeletonUploadZone />
      </div>
    </div>
  );
}

export default Skeleton;
