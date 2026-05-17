'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiFile } from 'react-icons/fi';
import { FileData } from '@/services/fileService';
import { formatFileSize, formatDate } from '@/utils/formatters';

interface PreviewModalProps {
  file: FileData | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: FileData) => void;
}

export default function PreviewModal({ file, isOpen, onClose, onDownload }: PreviewModalProps) {
  if (!isOpen || !file) return null;

  const renderPreview = () => {
    if (file.fileType === 'image') {
      return (
        <img src={file.fileUrl} alt={file.fileName}
          className="max-w-full max-h-[65vh] object-contain rounded-xl" />
      );
    }
    if (file.fileType === 'video') {
      return (
        <video src={file.fileUrl} controls autoPlay
          className="max-w-full max-h-[65vh] rounded-xl" />
      );
    }
    if (file.fileType === 'pdf') {
      return (
        <iframe src={file.fileUrl}
          className="w-full h-[65vh] rounded-xl border-0" title={file.fileName} />
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-24 h-24 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
          <FiFile className="w-12 h-12 text-muted" />
        </div>
        <p className="text-foreground font-medium mb-1">{file.fileName}</p>
        <p className="text-sm text-muted mb-4">Preview not available</p>
        <button onClick={() => onDownload(file)}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors cursor-pointer">
          <FiDownload className="w-4 h-4 inline mr-2" />Download
        </button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-surface-light border border-border shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex-1 min-w-0 mr-4">
              <h3 className="text-sm font-semibold text-foreground truncate">{file.fileName}</h3>
              <p className="text-xs text-muted mt-0.5">
                {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onDownload(file)}
                className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors cursor-pointer">
                <FiDownload className="w-5 h-5" />
              </button>
              <button onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors cursor-pointer">
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center p-4 overflow-auto max-h-[calc(90vh-80px)]">
            {renderPreview()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
