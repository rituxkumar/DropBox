'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fileService, FileData } from '@/services/fileService';
import { formatFileSize, formatDate } from '@/utils/formatters';
import { FiDownload, FiCloud, FiFile, FiImage, FiVideo, FiFileText } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

const typeIcons: Record<string, React.ElementType> = {
  image: FiImage, video: FiVideo, pdf: FiFileText,
  document: FiFile, archive: FiFile, other: FiFile,
};

export default function SharedFilePage() {
  const params = useParams();
  const token = params.token as string;
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await fileService.getSharedFile(token);
        setFile(res.data);
      } catch {
        setError('File not found or is no longer shared');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchFile();
  }, [token]);

  const handleDownload = async () => {
    if (!file) return;
    const toastId = toast.loading('Downloading file...');
    try {
      const response = await fetch(file.fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download completed!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Download failed', { id: toastId });
    }
  };

  const renderPreview = () => {
    if (!file) return null;
    if (file.fileType === 'image') {
      return <img src={file.fileUrl} alt={file.fileName}
        className="max-w-full max-h-[50vh] object-contain rounded-xl" />;
    }
    if (file.fileType === 'video') {
      return <video src={file.fileUrl} controls className="max-w-full max-h-[50vh] rounded-xl" />;
    }
    if (file.fileType === 'pdf') {
      const secureUrl = file.fileUrl.replace('http://', 'https://');
      return <iframe src={secureUrl} className="w-full h-[50vh] rounded-xl border-0" title={file.fileName} />;
    }
    const Icon = typeIcons[file.fileType] || FiFile;
    return (
      <div className="flex flex-col items-center py-12">
        <div className="w-20 h-20 rounded-2xl bg-surface-hover flex items-center justify-center mb-3">
          <Icon className="w-10 h-10 text-muted" />
        </div>
        <p className="text-sm text-muted">Preview not available</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dot-pattern p-4">
        <Toaster position="bottom-right" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <FiFile className="w-8 h-8 text-danger" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">File Not Found</h1>
          <p className="text-sm text-muted">{error || 'This shared link is invalid or expired'}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #2e2e35', borderRadius: '12px', fontSize: '14px' },
      }} />

      <nav className="sticky top-0 z-30 glass-strong">
        <div className="flex items-center justify-between h-14 px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <FiCloud className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold gradient-text">CloudVault</span>
          </div>
          <span className="text-xs text-muted">Shared File</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-surface-light border border-border overflow-hidden">
          <div className="flex items-center justify-center p-6 bg-surface min-h-[200px]">
            {renderPreview()}
          </div>
          <div className="p-5 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">{file.fileName}</h1>
                <p className="text-sm text-muted mt-1">
                  {formatFileSize(file.fileSize)} • Shared {formatDate(file.createdAt)}
                </p>
              </div>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
                <FiDownload className="w-4 h-4" /> Download File
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
