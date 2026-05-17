'use client';

import React from 'react';
import { FiMenu, FiPlus, FiLogOut, FiCloud } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

interface NavbarProps {
  onToggleSidebar: () => void;
  onUpload: () => void;
}

export default function Navbar({ onToggleSidebar, onUpload }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 w-full glass-strong">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-surface-hover text-muted hover:text-foreground transition-colors lg:hidden cursor-pointer">
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <FiCloud className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">CloudVault</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors cursor-pointer">
            <FiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </motion.button>

          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm text-foreground hidden md:block max-w-[120px] truncate">{user?.name}</span>
            <button onClick={logout}
              className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-danger transition-colors cursor-pointer" title="Logout">
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
