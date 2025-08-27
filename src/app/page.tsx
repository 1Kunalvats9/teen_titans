// src/app/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Features  from "@/components/ui/Features"
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-heading',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.hero-subtext',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo(
        '.hero-cta',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <main className="dark bg-[#0B0B0F] text-foreground min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-24" ref={heroRef}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto text-center px-4"
        >
          <motion.h1
            variants={itemVariants}
            className="hero-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
          >
            Build Your Personal <span className="text-white">Learning OS</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-zinc-100 via-zinc-400 to-zinc-700">AI Tutors • Modules • Quizzes • Community</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="hero-subtext mt-6 text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto"
          >
            Learn anything, faster. Generate personalized modules, practice with spaced repetition flashcards,
            solve doubts with your AI mentor, and grow with peers.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-10 hero-cta">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 mx-auto shadow-[0_0_0_1px_rgba(255,255,255,0.12)] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.18)]"
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
