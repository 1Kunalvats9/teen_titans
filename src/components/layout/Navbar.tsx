// src/components/landing/Navbar.tsx
'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { BrainCircuit, Menu, User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggleButton from '@/components/ui/theme-toggle-button';
import Link from 'next/link';

export const Navbar = () => {
  const navLinks = ['Features', 'Pricing', 'Community'];
  const { data: session } = useSession();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed top-0 text-foreground left-0 right-0 z-50 py-4 px-6 md:px-12 bg-transparent  border-b border-border"
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-creame" size={28} />
          <h1 className="text-xl font-bold text-primary">LearnOS</h1>
        </div>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <motion.li key={link} whileHover={{ scale: 1.05 }} className="text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer">
              {link}
            </motion.li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggleButton />
          {session?.user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {session.user.name || session.user.email?.split('@')[0]}
                </span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                className="p-2 text-muted-foreground hover:text-foreground transition-colors" 
                onClick={() => signOut()}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-2 text-primary font-semibold">
                  Log In
                </motion.button>
              </Link>
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0px 0px 8px rgb(37,99,235)' }}
                  className="bg-accent text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Sign Up
                </motion.button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
            <ThemeToggleButton />
            <Menu className="text-primary cursor-pointer" />
        </div>
      </div>
    </motion.nav>
  );
};
