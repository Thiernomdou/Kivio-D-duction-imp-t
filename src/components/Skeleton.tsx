"use client";

import { memo } from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton = memo(function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "wave",
}: SkeletonProps) {
  const baseClasses = "bg-white/10 skeleton";

  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "",
    rounded: "rounded-xl",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
});

// Skeleton préfabriqués pour le dashboard - Fast loading
export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6 page-transition">
      {/* Warning box skeleton */}
      <div className="rounded-xl p-4 bg-amber-500/5 border border-amber-500/10">
        <div className="flex gap-3">
          <Skeleton variant="rounded" className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="text" className="h-3 w-full" />
            <Skeleton variant="text" className="h-3 w-3/4" />
          </div>
        </div>
      </div>

      {/* Main content skeleton - 2 cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton variant="rounded" className="w-11 h-11" />
            <div className="space-y-2">
              <Skeleton variant="text" className="h-5 w-40" />
              <Skeleton variant="text" className="h-3 w-24" />
            </div>
          </div>
          <Skeleton variant="text" className="h-12 w-32 mb-6" />
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-3/4" />
          </div>
          <Skeleton variant="rounded" className="h-11 w-full mt-6" />
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton variant="rounded" className="w-11 h-11" />
            <div className="space-y-2">
              <Skeleton variant="text" className="h-5 w-36" />
              <Skeleton variant="text" className="h-3 w-48" />
            </div>
          </div>
          <Skeleton variant="rounded" className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
});

// Skeleton pour les cartes
export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="flex-1">
          <Skeleton variant="text" className="h-4 w-24 mb-1" />
          <Skeleton variant="text" className="h-3 w-16" />
        </div>
      </div>
      <Skeleton variant="text" className="h-6 w-20" />
    </div>
  );
});

// Skeleton pour les tables
export const TableSkeleton = memo(function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-3 border-b border-gray-200 dark:border-white/10">
        <Skeleton variant="text" className="h-4 w-20" />
        <Skeleton variant="text" className="h-4 w-32 flex-1" />
        <Skeleton variant="text" className="h-4 w-24" />
        <Skeleton variant="text" className="h-4 w-20" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 animate-pulse">
          <Skeleton variant="text" className="h-4 w-20" />
          <Skeleton variant="text" className="h-4 w-32 flex-1" />
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
});

export default Skeleton;
