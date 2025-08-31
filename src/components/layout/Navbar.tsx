// src/components/landing/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Menu, User, LogOut, LayoutDashboard, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import ThemeToggleButton from '@/components/ui/theme-toggle-button';
import Link from 'next/link';

export const Navbar = () => {
  const navLinks = ['Features', 'Pricing', 'Community'];
  const { user, logout, isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className={`fixed top-0 text-foreground left-0 right-0 z-50 py-4 px-6 md:px-12 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm' 
          : 'bg-transparent border-b border-border/20'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="text-creame" size={28} />
          <h1 className="text-xl font-bold text-primary">LearnOS</h1>
        </Link>

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
          {!isLoading && user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </motion.button>
              </Link>
              <Link href="/chatbot">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  className="flex items-center gap-2 px-3 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  title="AI Chatbot"
                >
                  <Bot className="w-4 h-4" />
                  <span className="text-sm font-medium">Chatbot</span>
                </motion.button>
              </Link>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {user.name || user.email?.split('@')[0]}
                </span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" 
                onClick={() => logout()}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          ) : !isLoading ? (
            <>
              <Link href="/login">
                <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-2 text-primary font-semibold cursor-pointer">
                  Log In
                </motion.button>
              </Link>
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0px 0px 8px rgb(37,99,235)' }}
                  className="bg-accent text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Sign Up
                </motion.button>
              </Link>
            </>
          ) : null}
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
