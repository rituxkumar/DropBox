'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiImage,
  FiVideo,
  FiFileText,
  FiFile,
  FiArchive,
  FiMoreVertical,
  FiDownload,
  FiTrash2,
  FiEdit3,
  FiShare2,
  FiEye,
  FiMessageSquare,
} from 'react-icons/fi';
import { FileData } from '@/services/fileService';
import { formatFileSize, formatDate, truncateFileName } from '@/utils/formatters';

interface FileCardProps {
  file: FileData;
  index: number;
  onPreview: (file: FileData) => void;
  onDownload: (file: FileData) => void;
  onDelete: (file: FileData) => void;
  onRename: (file: FileData) => void;
  onShare: (file: FileData) => void;
  onChat: (file: FileData) => void;
}

const fileIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  image: { icon: FiImage, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  video: { icon: FiVideo, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  pdf: { icon: FiFileText, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  document: { icon: FiFile, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  archive: { icon: FiArchive, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  other: { icon: FiFile, color: '#71717a', bg: 'rgba(113,113,122,0.15)' },
};

export default function FileCard({
  file,
  index,
  onPreview,
  onDownload,
  onDelete,
  onRename,
  onShare,
  onChat,
}: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { icon: FileIcon, color, bg } = fileIcons[file.fileType] || fileIcons.other;

  const renderThumbnail = () => {
    if (file.fileType === 'image') {
      return (
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-surface-hover">
          <img
            src={file.fileUrl}
            alt={file.fileName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      );
    }

    if (file.fileType === 'video') {
      return (
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-surface-hover flex items-center justify-center">
          <video
            src={file.fileUrl}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FiVideo className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="w-full h-36 rounded-xl flex items-center justify-center"
        style={{ background: bg }}
      >
        <FileIcon className="w-12 h-12" style={{ color }} />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl bg-surface border border-border hover:border-border-light p-4 transition-colors"
    >
      {/* Thumbnail / Preview */}
      <div
        className="cursor-pointer mb-3"
        onClick={() => onPreview(file)}
      >
        {renderThumbnail()}
      </div>

      {/* File info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate" title={file.fileName}>
            {truncateFileName(file.fileName)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted">{formatFileSize(file.fileSize)}</span>
            <span className="text-xs text-border-light">•</span>
            <span className="text-xs text-muted">{formatDate(file.createdAt)}</span>
          </div>
        </div>

        {/* Context menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <FiMoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-8 z-50 w-44 rounded-xl bg-surface-light border border-border shadow-xl py-1.5"
              >
                <button
                  onClick={() => { onPreview(file); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <FiEye className="w-4 h-4" /> Preview
                </button>
                <button
                  onClick={() => { onDownload(file); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <FiDownload className="w-4 h-4" /> Download
                </button>
                <button
                  onClick={() => { onRename(file); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <FiEdit3 className="w-4 h-4" /> Rename
                </button>
                <button
                  onClick={() => { onShare(file); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <FiShare2 className="w-4 h-4" /> Share
                </button>
                {(file.fileType === 'pdf' || file.fileType === 'document' || file.mimeType.includes('text/')) && (
                  <button
                    onClick={() => { onChat(file); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <FiMessageSquare className="w-4 h-4" /> Talk to AI
                  </button>
                )}
                <hr className="my-1 border-border" />
                <button
                  onClick={() => { onDelete(file); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                >
                  <FiTrash2 className="w-4 h-4" /> Delete
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Quick actions bar on hover */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDownload(file)}
          className="flex-1 py-1.5 rounded-lg bg-surface-hover/80 backdrop-blur text-xs text-foreground hover:bg-primary hover:text-white transition-colors text-center cursor-pointer"
        >
          <FiDownload className="w-3.5 h-3.5 inline mr-1" />
          Download
        </button>
        <button
          onClick={() => onShare(file)}
          className="flex-1 py-1.5 rounded-lg bg-surface-hover/80 backdrop-blur text-xs text-foreground hover:bg-primary hover:text-white transition-colors text-center cursor-pointer"
        >
          <FiShare2 className="w-3.5 h-3.5 inline mr-1" />
          Share
        </button>
      </div>
    </motion.div>
  );
}
