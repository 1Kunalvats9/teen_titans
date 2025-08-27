// src/components/landing/Features.tsx
'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { BotMessageSquare, BookOpenCheck, Users, BarChart3, Star, Zap } from 'lucide-react';

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

const Features = () => {
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

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Everything You Need, All in One Place
        </h2>
        <p className="text-secondary text-center max-w-2xl mx-auto mb-12">
          LearnOS is built with powerful, interconnected features designed to create the most efficient learning environment.
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
              className="bg-zinc-900 p-6 rounded-lg border border-border transition-all duration-300 hover:border-accent hover:-translate-y-1"
            >
              <div className="text-accent mb-4 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                {React.cloneElement(feature.icon, { size: 24 })}
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{feature.title}</h3>
              <p className="text-secondary">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};


export default Features