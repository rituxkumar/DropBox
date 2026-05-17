import api from '@/lib/axios';

export interface FileData {
  _id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  publicId: string;
  fileType: 'image' | 'video' | 'pdf' | 'document' | 'archive' | 'other';
  mimeType: string;
  fileSize: number;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  isPublic: boolean;
  shareToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileStats {
  totalSize: number;
  totalFiles: number;
  images: number;
  videos: number;
  pdfs: number;
  documents: number;
  archives: number;
}

export interface FilesResponse {
  success: boolean;
  data: FileData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: FileStats;
}

export interface FileQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  sort?: string;
}

export const fileService = {
  uploadFiles: async (
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; data: FileData[]; message: string }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const { data } = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    });
    return data;
  },

  getFiles: async (query: FileQuery = {}): Promise<FilesResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.type) params.append('type', query.type);
    if (query.sort) params.append('sort', query.sort);

    const { data } = await api.get(`/files?${params.toString()}`);
    return data;
  },

  getFile: async (id: string): Promise<{ success: boolean; data: FileData }> => {
    const { data } = await api.get(`/files/${id}`);
    return data;
  },

  updateFile: async (
    id: string,
    updates: { fileName?: string; isPublic?: boolean }
  ): Promise<{ success: boolean; data: FileData }> => {
    const { data } = await api.put(`/files/${id}`, updates);
    return data;
  },

  deleteFile: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete(`/files/${id}`);
    return data;
  },

  downloadFile: async (
    id: string
  ): Promise<{ success: boolean; data: { url: string; fileName: string } }> => {
    const { data } = await api.get(`/files/download/${id}`);
    return data;
  },

  getSharedFile: async (
    shareToken: string
  ): Promise<{ success: boolean; data: FileData }> => {
    const { data } = await api.get(`/files/shared/${shareToken}`);
    return data;
  },
};
