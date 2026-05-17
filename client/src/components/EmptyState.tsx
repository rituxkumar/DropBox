'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiUploadCloud } from 'react-icons/fi';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function EmptyState({
  title = 'No files yet',
  description = 'Upload your first file to get started',
  onAction,
  actionLabel = 'Upload Files',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center mb-6"
      >
        <FiUploadCloud className="w-14 h-14 text-primary" />
      </motion.div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted text-sm text-center max-w-sm mb-6">{description}</p>
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors cursor-pointer"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
