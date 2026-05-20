'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import FileCard from './FileCard';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import { FileData } from '@/services/fileService';

interface FileGridProps {
  files: FileData[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onPreview: (file: FileData) => void;
  onDownload: (file: FileData) => void;
  onDelete: (file: FileData) => void;
  onRename: (file: FileData) => void;
  onShare: (file: FileData) => void;
  onChat: (file: FileData) => void;
  onUpload: () => void;
}

export default function FileGrid({
  files, loading, loadingMore, hasMore, onLoadMore,
  onPreview, onDownload, onDelete, onRename, onShare, onChat, onUpload,
}: FileGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore) {
        onLoadMore();
      }
    },
    [hasMore, loadingMore, onLoadMore]
  );

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  if (loading) return <LoadingSkeleton count={8} />;

  if (files.length === 0) {
    return <EmptyState onAction={onUpload} />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <FileCard key={file._id} file={file} index={index}
            onPreview={onPreview} onDownload={onDownload}
            onDelete={onDelete} onRename={onRename} onShare={onShare} onChat={onChat} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="h-10 mt-4">
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </div>
    </>
  );
}
