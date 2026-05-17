'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  count?: number;
}

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-surface border border-border p-4">
    <div className="skeleton h-36 rounded-xl mb-4" />
    <div className="skeleton h-4 rounded-lg w-3/4 mb-2" />
    <div className="skeleton h-3 rounded-lg w-1/2 mb-4" />
    <div className="flex justify-between items-center">
      <div className="skeleton h-3 rounded-lg w-1/3" />
      <div className="skeleton h-8 w-8 rounded-lg" />
    </div>
  </div>
);

export default function LoadingSkeleton({ count = 8 }: LoadingSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </motion.div>
  );
}
