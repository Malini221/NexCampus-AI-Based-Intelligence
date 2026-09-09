import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  userProfile: UserProfile;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onToggleMobileMenu: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  unreadCount,
  onOpenNotifications,
  onOpenSearch,
  onOpenSettings,
  onToggleMobileMenu,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <header className="fixed top-0 left-0 lg:left-64 xl:left-72 right-0 h-16 bg-surface-card border-b border-border-subtle z-40 px-4 sm:px-6 shadow-xs flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-sm sm:text-[15px] font-bold tracking-tight text-on-surface leading-tight truncate">
              Good morning, {userProfile.name.split(' ')[0]}
            </h1>
            <span className="text-outline text-xs hidden sm:inline">•</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-status-resolved-bg text-status-resolved-fg font-label-md text-[11px] font-semibold leading-tight">
              Campus Zone
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 leading-none mt-1">
            <span className="font-mono-code text-[11px] font-semibold text-on-surface-variant">
              Campus ID {userProfile.studentId}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-2 sm:mx-4">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={onOpenSearch}
            placeholder="Search"
            aria-label="Search"
            className="w-full h-9 sm:h-10 pl-9 pr-3 rounded-xl bg-surface-card border border-border-subtle hover:border-border-hover focus:outline-none focus:ring-2 focus:ring-primary font-body-md text-xs text-on-surface placeholder:text-outline shadow-xs transition-all duration-150"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="View notifications"
          className="relative w-9 h-9 rounded-xl bg-surface-card hover:bg-surface-container border border-border-subtle text-on-surface flex items-center justify-center transition-colors cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-urgent-fg ring-2 ring-surface-card" />
          )}
        </button>

        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-border-subtle cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shadow-xs shrink-0 group-hover:ring-2 group-hover:ring-primary/40 transition-all">
            MS
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-title text-xs font-bold leading-tight text-on-surface group-hover:text-primary transition-colors">
              {userProfile.name}
            </span>
            <span className="font-body-sm text-[10px] font-medium leading-tight text-status-resolved-fg flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-resolved-fg" />
              Online
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
