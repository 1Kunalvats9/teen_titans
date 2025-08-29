import React from 'react';
import { ArrowDown } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import GalacticButton, {Variant} from './GalacticButton';

const HeroGridSection = () => {
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
    // The main section container. `isolate` creates a new stacking context,
    // which is good for complex z-index layering.
    <section className="relative isolate transform-gpu pt-14 bg-zinc-950">
      
      {/* Layer 1: Radial gradient glow effect */}
      <div
        className="absolute inset-0 -z-10 bg-[image:radial-gradient(80%_50%_at_50%_-20%,hsl(206,81.9%,65.3%,0.3),rgba(255,255,255,0))]"
        aria-hidden="true"
      />

      {/* Layer 2: SVG Grid Pattern */}
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-white/10 [mask-image:radial-gradient(75%_50%_at_top_center,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="hero-grid-pattern-2"
            width="80"
            height="80"
            x="50%"
            y="-1"
            patternUnits="userSpaceOnUse"
          >
            {/* Corrected path for a proper grid based on the 80x80 pattern size */}
            <path d="M.5 80V.5H80" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero-grid-pattern-2)" />
      </svg>
      
      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl text-center">
            <motion.h1
            variants={itemVariants}
            className="bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-5xl/[1.07] font-bold tracking-tight text-transparent md:text-7xl/[1.07]"
            style={{opacity: 1,transform: "none"}}
          >
            Build Your Personal <span className="text-primary">Learning OS</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-zinc-100 via-zinc-400 to-zinc-700">AI Tutors • Modules • Quizzes • Community</span>
          </motion.h1>
            <motion.p
            variants={itemVariants}
            className="hero-subtext mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Learn anything, faster. Generate personalized modules, practice with spaced repetition flashcards,
            solve doubts with your AI mentor, and grow with peers.
          </motion.p>
            <div className="mt-10 flex flex-col items-center justify-center gap-y-8">
              {/* Join Waitlist Button */}
              <GalacticButton text="Get started for free" variant={Variant.FULL} color="cyan-400/90" />
            
              {/* Learn More Link */}
              <Link className="group flex flex-col items-center gap-1" href="/#intro">
                <p className="text-sm/6 text-zinc-400 duration-300 group-hover:text-zinc-100">
                  Learn more
                </p>
                <ArrowDown className="text-zinc-400 duration-300 group-hover:translate-y-1.5 group-hover:text-zinc-100" />
              </Link>
            </div>
          </div>
          
          {/* Image and Particles Section */}
          <div className="relative pt-16 [perspective:1500px]">
            {/* The particle effect canvas would require a library like react-tsparticles to function */}
            <div
              id="tsparticles-container"
              className="pointer-events-none absolute -top-36 left-1/2 h-[32rem] w-full -translate-x-1/2 -translate-y-1/2 overflow-hidden lg:w-[60rem]"
            />
            <div className="relative">
              {/* Animated line effects */}
              <div className="absolute -top-px right-20 h-2 w-20 [mask-image:linear-gradient(to_right,rgba(217,217,217,0)_0%,#d9d9d9_25%,#d9d9d9_75%,rgba(217,217,217,0)_100%)] md:w-32 lg:w-64">
                <div className="h-px w-full animate-starlight-right bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-cyan-400/0" />
              </div>
              
              {/* <div className="rounded-md bg-zinc-950 ring-1 ring-white/10 lg:rounded-2xl">
                <img
                  alt="App screenshot"
                  fetchPriority="high"
                  className="rounded-md lg:rounded-2xl"
                  src="/_static/dashboard.png"
                />
              </div> */}
              
              <div className="absolute -bottom-2 left-20 h-2 w-20 [mask-image:linear-gradient(to_right,rgba(217,217,217,0)_0%,#d9d9d9_25%,#d9d9d9_75%,rgba(217,217,217,0)_100%)] md:w-32 lg:w-64">
                <div className="h-px w-full animate-starlight-left bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-cyan-400/0" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Layer 3: Blur effect at the bottom */}
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      />
    </section>
  );
};

export default HeroGridSection;
