'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiFolder, FiImage, FiVideo, FiFileText, FiArchive, FiFile, FiX, FiHardDrive } from 'react-icons/fi';
import { formatFileSize } from '@/utils/formatters';
import { FileStats } from '@/services/fileService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  stats: FileStats;
}

const navItems = [
  { id: '', label: 'All Files', icon: FiFolder },
  { id: 'image', label: 'Images', icon: FiImage },
  { id: 'video', label: 'Videos', icon: FiVideo },
  { id: 'pdf', label: 'PDFs', icon: FiFileText },
  { id: 'document', label: 'Documents', icon: FiFile },
  { id: 'archive', label: 'Archives', icon: FiArchive },
];

export default function Sidebar({ isOpen, onClose, activeFilter, onFilterChange, stats }: SidebarProps) {
  const getCount = (id: string) => {
    if (id === '') return stats.totalFiles;
    const map: Record<string, number> = {
      image: stats.images, video: stats.videos, pdf: stats.pdfs,
      document: stats.documents, archive: stats.archives,
    };
    return map[id] || 0;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 lg:hidden">
        <span className="text-lg font-bold gradient-text">CloudVault</span>
        <button onClick={onClose}
          className="p-2 rounded-lg hover:bg-surface-hover text-muted cursor-pointer">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1">
        <button onClick={() => { onFilterChange('dashboard'); onClose(); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            activeFilter === 'dashboard' ? 'bg-primary/15 text-primary' : 'text-muted hover:text-foreground hover:bg-surface-hover'
          }`}>
          <FiHome className="w-4.5 h-4.5" />
          Dashboard
        </button>

        <div className="pt-3 pb-2">
          <p className="px-3 text-xs font-semibold text-muted uppercase tracking-wider">Files</p>
        </div>

        {navItems.map((item) => (
          <button key={item.id} onClick={() => { onFilterChange(item.id); onClose(); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeFilter === item.id ? 'bg-primary/15 text-primary' : 'text-muted hover:text-foreground hover:bg-surface-hover'
            }`}>
            <div className="flex items-center gap-3">
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </div>
            <span className="text-xs opacity-60">{getCount(item.id)}</span>
          </button>
        ))}
      </div>

      <div className="p-4 mx-3 mb-4 rounded-xl bg-surface border border-border">
        <div className="flex items-center gap-2 mb-3">
          <FiHardDrive className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Storage</span>
        </div>
        <div className="h-2 rounded-full bg-surface-hover overflow-hidden mb-2">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            style={{ width: `${Math.min((stats.totalSize / (1024 * 1024 * 1024)) * 100, 100)}%` }} />
        </div>
        <p className="text-xs text-muted">{formatFileSize(stats.totalSize)} used</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface-light h-[calc(100vh-64px)] sticky top-16">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-surface-light border-r border-border lg:hidden">
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
