// src/components/landing/Navbar.tsx
'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { BrainCircuit, Menu } from 'lucide-react';
import { LoginModal } from '@/components/ui/login-modal';

export const Navbar = () => {
  const navLinks = ['Features', 'Pricing', 'Community'];
  const [loginOpen, setLoginOpen] = React.useState(false);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed top-0 dark text-foreground left-0 right-0 z-50 py-4 px-6 md:px-12 bg-background/80 backdrop-blur-sm border-b border-border"
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
            <motion.li key={link} whileHover={{ scale: 1.1, color: '#F5F5F5' }} className="text-secondary font-medium text-white cursor-pointer">
              {link}
            </motion.li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-2 text-primary font-semibold" onClick={() => setLoginOpen(true)}>
            Log In
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 8px rgb(37,99,235)' }}
            className="bg-accent text-white font-semibold px-4 py-2 rounded-lg"
            onClick={() => setLoginOpen(true)}
          >
            Sign Up
          </motion.button>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
            <Menu className="text-primary cursor-pointer" />
        </div>
      </div>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </motion.nav>
  );
};
