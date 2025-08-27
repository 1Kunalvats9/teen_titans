// src/app/page.tsx
'use client';

import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import Features  from "@/components/ui/Features"
import { Footer } from '@/components/layout/Footer';

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
  };

  return (
    // Add the "dark" class to the main element to enable the dark theme
    <main className="dark bg-background text-foreground min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto text-center px-4"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight"
          >
            Your Personal AI-Powered <br />
            {/* Using the primary color from the theme for emphasis */}
            <span className="text-primary">Learning Universe</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Go beyond traditional learning with interactive modules, AI-powered
            doubt solving, and a vibrant community. All in one platform.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-10">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              // UPDATED: Changed to a dark button with light text for better dark-theme consistency
              className="bg-secondary text-secondary-foreground font-semibold px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
            >
              Get Started for Free
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      <Features />
    </main>
  );
}
