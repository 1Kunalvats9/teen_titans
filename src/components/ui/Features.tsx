// src/components/ui/Features.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { BotMessageSquare, BookOpenCheck, Users, BarChart3, Star, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const featureList = [
  {
    icon: <BookOpenCheck />,
    title: 'Interactive Learning Modules',
    description: 'Structure your knowledge with custom modules, steps, quizzes, and flashcards for effective learning.',
  },
  {
    icon: <BotMessageSquare />,
    title: 'AI-Powered Doubt Solving',
    description: 'Never get stuck again. Get instant, contextual answers and explanations from your personal AI tutor.',
  },
  {
    icon: <Users />,
    title: 'Collaborative Chat Rooms',
    description: 'Join module-specific chat rooms to discuss topics, collaborate on projects, and learn with peers.',
  },
  {
    icon: <BarChart3 />,
    title: 'Personalized Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics on quiz attempts, module completion, and SRS.',
  },
  {
    icon: <Star />,
    title: 'Gamified Experience',
    description: 'Earn XP, maintain streaks, and unlock badges as you master new skills, making learning addictive.',
  },
  {
    icon: <Zap />,
    title: 'Spaced Repetition System',
    description: 'Master concepts for the long term with our integrated flashcard system based on SRS principles.',
  },
];

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    
    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 50 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.feature-title',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="py-24 bg-[#0B0B0F]">
      <div className="container mx-auto px-4" ref={sectionRef}>
        <h2 className="feature-title text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          Everything You Need, All in One Place
        </h2>
        <p className="text-zinc-300 text-center max-w-2xl mx-auto mb-12">
          Personalized AI tutors, module creation, quizzes, flashcards (SRS), collaborative rooms, and analytics to guide your journey.
        </p>

        <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featureList.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-[#111317] p-6 rounded-xl border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-white/10"
            >
              <div className="text-white mb-4 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                {React.cloneElement(feature.icon, { size: 24 })}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-zinc-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;