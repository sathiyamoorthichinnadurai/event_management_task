import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
      {/* Banner Skeleton */}
      <div className="w-full h-48 bg-slate-200" />

      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Tags & Badges */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 bg-slate-200 rounded-full" />
            <div className="h-5 w-16 bg-slate-200 rounded-full" />
          </div>

          {/* Title */}
          <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
          <div className="h-4 w-1/2 bg-slate-200 rounded-md" />

          {/* Summary */}
          <div className="space-y-1.5 pt-2">
            <div className="h-3.5 w-full bg-slate-200 rounded" />
            <div className="h-3.5 w-5/6 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Footer Meta Skeleton */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-8 w-24 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

