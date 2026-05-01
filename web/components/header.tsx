"use client";

import Link from 'next/link';
import Logo from '@/components/logo';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-surface-border bg-white dark:bg-background-dark px-6 py-3 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-8">
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/problems"
            className="text-slate-900 dark:text-white text-sm font-medium leading-normal border-b-2 border-primary py-4 -my-4 transition-all"
          >
            Problems
          </Link>
          <Link
            href="/contest"
            className="text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white text-sm font-medium leading-normal transition-all hover:-translate-y-0.5"
          >
            Contest
          </Link>
          <Link
            href="/discuss"
            className="text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white text-sm font-medium leading-normal transition-all hover:-translate-y-0.5"
          >
            Discuss
          </Link>
          <Link
            href="/interview"
            className="text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white text-sm font-medium leading-normal transition-all hover:-translate-y-0.5"
          >
            Interview
          </Link>
          <Link
            href="/store"
            className="text-primary text-sm font-medium leading-normal flex items-center gap-1 transition-all hover:scale-110 active:scale-95"
          >
            Store
          </Link>
        </nav>
      </div>

      <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
        <label className="hidden md:flex flex-col min-w-40 h-9! max-w-64 group">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-surface-border overflow-hidden transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 group-focus-within:bg-white dark:group-focus-within:bg-slate-800">
            <div className="text-slate-400 dark:text-text-secondary flex items-center justify-center pl-3 group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input
              className="flex w-full min-w-0 flex-1 resize-none bg-transparent border-none text-slate-900 dark:text-white focus:outline-0 focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-text-secondary px-3 text-sm font-normal leading-normal"
              placeholder="Search"
            />
          </div>
        </label>

        <button className="hidden sm:flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider transition-all active:scale-95 hover:shadow-lg hover:shadow-primary/10">
          Premium
        </button>

        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-slate-500 dark:text-text-secondary cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
            notifications
          </span>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer group">
                  <Avatar className="size-8 border border-slate-200 dark:border-surface-border transition-transform group-hover:scale-110">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-slate-200 dark:border-surface-border bg-white dark:bg-background-dark">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                    <span className="text-xs text-slate-500 dark:text-text-secondary">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-surface-border" />
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-surface-border">
                  <span className="material-symbols-outlined mr-2 text-lg">person</span>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-surface-border">
                  <span className="material-symbols-outlined mr-2 text-lg">settings</span>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-surface-border" />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={logout}
                >
                  <span className="material-symbols-outlined mr-2 text-lg">logout</span>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-surface-border"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
