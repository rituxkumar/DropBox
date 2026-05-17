'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fileService, FileData, FileStats, FileQuery } from '@/services/fileService';
import { useDebounce } from './useDebounce';

interface UseFilesReturn {
  files: FileData[];
  stats: FileStats;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  search: string;
  setSearch: (s: string) => void;
  fileType: string;
  setFileType: (t: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  fetchFiles: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  totalFiles: number;
}

const defaultStats: FileStats = {
  totalSize: 0,
  totalFiles: 0,
  images: 0,
  videos: 0,
  pdfs: 0,
  documents: 0,
  archives: 0,
};

export function useFiles(): UseFilesReturn {
  const [files, setFiles] = useState<FileData[]>([]);
  const [stats, setStats] = useState<FileStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');

  const debouncedSearch = useDebounce(search, 400);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const query: FileQuery = {
        page: 1,
        limit: 20,
        search: debouncedSearch,
        type: fileType,
        sort: sortBy,
      };
      const res = await fileService.getFiles(query);
      if (isMounted.current) {
        setFiles(res.data);
        setStats(res.stats);
        setTotalFiles(res.pagination.total);
        setPage(1);
        setHasMore(res.pagination.page < res.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [debouncedSearch, fileType, sortBy]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const query: FileQuery = {
        page: nextPage,
        limit: 20,
        search: debouncedSearch,
        type: fileType,
        sort: sortBy,
      };
      const res = await fileService.getFiles(query);
      if (isMounted.current) {
        setFiles((prev) => [...prev, ...res.data]);
        setPage(nextPage);
        setHasMore(res.pagination.page < res.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load more files:', error);
    } finally {
      if (isMounted.current) setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, debouncedSearch, fileType, sortBy]);

  const refresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    files,
    stats,
    loading,
    loadingMore,
    hasMore,
    search,
    setSearch,
    fileType,
    setFileType,
    sortBy,
    setSortBy,
    fetchFiles,
    loadMore,
    refresh,
    totalFiles,
  };
}
