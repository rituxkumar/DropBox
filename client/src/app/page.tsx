'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFiles } from '@/hooks/useFiles';
import { fileService, FileData } from '@/services/fileService';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import FileGrid from '@/components/FileGrid';
import UploadModal from '@/components/UploadModal';
import PreviewModal from '@/components/PreviewModal';
import ShareModal from '@/components/ShareModal';
import AiChatPanel from '@/components/AiChatPanel';
import StatsCard from '@/components/StatsCard';
import { FiFolder, FiHardDrive, FiImage, FiVideo, FiFileText, FiArchive } from 'react-icons/fi';
import { formatFileSize } from '@/utils/formatters';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    files, stats, loading, loadingMore, hasMore,
    search, setSearch, fileType, setFileType, sortBy, setSortBy,
    loadMore, refresh,
  } = useFiles();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);
  const [shareFile, setShareFile] = useState<FileData | null>(null);
  const [chatFile, setChatFile] = useState<FileData | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [renameFile, setRenameFile] = useState<FileData | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const handleFilterChange = useCallback((filter: string) => {
    if (filter === 'dashboard') {
      setActiveView('dashboard');
      setFileType('');
    } else {
      setActiveView('files');
      setFileType(filter);
    }
  }, [setFileType]);

  const handleDownload = useCallback(async (file: FileData) => {
    const toastId = toast.loading('Downloading file...');
    try {
      const res = await fileService.downloadFile(file._id);
      
      // Fetch the file as a blob to force same-origin browser download
      const response = await fetch(res.data.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download completed!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Download failed', { id: toastId });
    }
  }, []);

  const handleDelete = useCallback(async (file: FileData) => {
    if (!confirm(`Delete "${file.fileName}"?`)) return;
    try {
      await fileService.deleteFile(file._id);
      toast.success('File deleted');
      refresh();
    } catch { toast.error('Delete failed'); }
  }, [refresh]);

  const handleRenameSubmit = useCallback(async () => {
    if (!renameFile || !renameValue.trim()) return;
    try {
      await fileService.updateFile(renameFile._id, { fileName: renameValue.trim() });
      toast.success('File renamed');
      setRenameFile(null);
      refresh();
    } catch { toast.error('Rename failed'); }
  }, [renameFile, renameValue, refresh]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const recentFiles = files.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onUpload={() => setUploadOpen(true)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
          activeFilter={activeView === 'dashboard' ? 'dashboard' : fileType}
          onFilterChange={handleFilterChange} stats={stats} />

        <main className="flex-1 p-4 lg:p-6 min-h-[calc(100vh-64px)]">
          {activeView === 'dashboard' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {user.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-muted mt-1">Here&apos;s your storage overview</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatsCard label="Total Files" value={stats.totalFiles} icon={FiFolder}
                  gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" delay={0} />
                <StatsCard label="Storage Used" value={formatFileSize(stats.totalSize)} icon={FiHardDrive}
                  gradient="linear-gradient(135deg, #06b6d4, #3b82f6)" delay={0.05} />
                <StatsCard label="Images" value={stats.images} icon={FiImage}
                  gradient="linear-gradient(135deg, #8b5cf6, #a855f7)" delay={0.1} />
                <StatsCard label="Videos" value={stats.videos} icon={FiVideo}
                  gradient="linear-gradient(135deg, #ef4444, #f97316)" delay={0.15} />
                <StatsCard label="Documents" value={stats.documents + stats.pdfs} icon={FiFileText}
                  gradient="linear-gradient(135deg, #3b82f6, #06b6d4)" delay={0.2} />
                <StatsCard label="Archives" value={stats.archives} icon={FiArchive}
                  gradient="linear-gradient(135deg, #22c55e, #16a34a)" delay={0.25} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Recent Uploads</h2>
                  <button onClick={() => setActiveView('files')}
                    className="text-sm text-primary hover:text-primary-hover cursor-pointer">
                    View all →
                  </button>
                </div>
                <FileGrid files={recentFiles} loading={loading} loadingMore={false}
                  hasMore={false} onLoadMore={() => {}}
                  onPreview={setPreviewFile} onDownload={handleDownload}
                  onDelete={handleDelete} onRename={(f) => { setRenameFile(f); setRenameValue(f.fileName); }}
                  onShare={setShareFile} onChat={setChatFile} onUpload={() => setUploadOpen(true)} />
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-xl font-bold text-foreground">
                  {fileType ? `${fileType.charAt(0).toUpperCase() + fileType.slice(1)}s` : 'All Files'}
                  <span className="text-sm font-normal text-muted ml-2">({files.length})</span>
                </h1>
              </div>

              <SearchBar search={search} onSearchChange={setSearch}
                fileType={fileType} onFileTypeChange={(t) => { setFileType(t); setActiveView('files'); }}
                sortBy={sortBy} onSortChange={setSortBy} />

              <FileGrid files={files} loading={loading} loadingMore={loadingMore}
                hasMore={hasMore} onLoadMore={loadMore}
                onPreview={setPreviewFile} onDownload={handleDownload}
                onDelete={handleDelete} onRename={(f) => { setRenameFile(f); setRenameValue(f.fileName); }}
                onShare={setShareFile} onChat={setChatFile} onUpload={() => setUploadOpen(true)} />
            </motion.div>
          )}
        </main>
      </div>

      {/* Modals */}
      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onUploadComplete={refresh} />
      <PreviewModal file={previewFile} isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)} onDownload={handleDownload} />
      <ShareModal file={shareFile} isOpen={!!shareFile}
        onClose={() => setShareFile(null)} onUpdate={refresh} />
      <AiChatPanel file={chatFile} isOpen={!!chatFile}
        onClose={() => setChatFile(null)} />

      {/* Rename dialog */}
      {renameFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setRenameFile(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl bg-surface-light border border-border p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Rename File</h3>
            <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 mb-4"
              autoFocus />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRenameFile(null)}
                className="px-4 py-2 rounded-xl text-sm text-muted hover:bg-surface-hover cursor-pointer">Cancel</button>
              <button onClick={handleRenameSubmit}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium cursor-pointer">Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
