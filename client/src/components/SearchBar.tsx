'use client';

import React from 'react';
import { FiSearch, FiFilter, FiArrowDown } from 'react-icons/fi';

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  fileType: string;
  onFileTypeChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const fileTypes = [
  { value: '', label: 'All Types' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'document', label: 'Documents' },
  { value: 'archive', label: 'Archives' },
];

const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'fileName', label: 'Name A-Z' },
  { value: '-fileName', label: 'Name Z-A' },
  { value: '-fileSize', label: 'Largest First' },
  { value: 'fileSize', label: 'Smallest First' },
];

export default function SearchBar({
  search,
  onSearchChange,
  fileType,
  onFileTypeChange,
  sortBy,
  onSortChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder-muted text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* File type filter */}
      <div className="relative">
        <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <select
          value={fileType}
          onChange={(e) => onFileTypeChange(e.target.value)}
          className="appearance-none pl-10 pr-8 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
        >
          {fileTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="relative">
        <FiArrowDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none pl-10 pr-8 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
        >
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
