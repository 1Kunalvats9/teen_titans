// src/app/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Features  from "@/components/ui/Features"
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Link from 'next/link';
import HeroGridSection from '@/components/ui/HeroGridSection';
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

  // Lenis smooth scroll for home page only
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      wheelMultiplier: 1.3,
      touchMultiplier: 1.5,
      smoothWheel: true,
    });

    // If using ScrollTrigger, update it on scroll
    const onScroll = () => {
      if (ScrollTrigger) {
        ScrollTrigger.update();
      }
    };
    lenis.on('scroll', onScroll);

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off?.('scroll', onScroll);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <HeroGridSection />
      <Features />
    </main>
  );
}
