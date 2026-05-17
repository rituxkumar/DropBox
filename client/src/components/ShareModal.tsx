'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCopy, FiCheck, FiGlobe, FiLock } from 'react-icons/fi';
import { FileData } from '@/services/fileService';
import { fileService } from '@/services/fileService';
import toast from 'react-hot-toast';

interface ShareModalProps {
  file: FileData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ShareModal({ file, isOpen, onClose, onUpdate }: ShareModalProps) {
  const [isPublic, setIsPublic] = useState(file?.isPublic || false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !file) return null;

  const shareUrl = `${window.location.origin}/shared/${file.shareToken}`;

  const togglePublic = async () => {
    try {
      setLoading(true);
      await fileService.updateFile(file._id, { isPublic: !isPublic });
      setIsPublic(!isPublic);
      onUpdate();
      toast.success(isPublic ? 'Link disabled' : 'Link enabled');
    } catch {
      toast.error('Failed to update sharing');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl bg-surface-light border border-border shadow-2xl"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Share File</h2>
            <button onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors cursor-pointer">
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted truncate">{file.fileName}</p>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <FiGlobe className="w-5 h-5 text-success" />
                ) : (
                  <FiLock className="w-5 h-5 text-muted" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isPublic ? 'Public link enabled' : 'Private'}
                  </p>
                  <p className="text-xs text-muted">
                    {isPublic ? 'Anyone with the link can view' : 'Only you can access'}
                  </p>
                </div>
              </div>
              <button onClick={togglePublic} disabled={loading}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  isPublic ? 'bg-primary' : 'bg-border'
                }`}>
                <motion.div
                  animate={{ x: isPublic ? 20 : 2 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white" />
              </button>
            </div>
            {isPublic && (
              <motion.div initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}>
                <div className="flex gap-2">
                  <input type="text" readOnly value={shareUrl}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm truncate" />
                  <button onClick={copyLink}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors cursor-pointer flex items-center gap-2">
                    {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
