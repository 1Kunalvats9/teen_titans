'use client'

import React from 'react';
import { BrainCircuit, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
    const socialLinks = [
        { icon: <Twitter />, href: 'https://twitter.com/learnos_ai', label: 'Twitter' },
        { icon: <Github />, href: 'https://github.com/learnos_ai', label: 'GitHub' },
        { icon: <Linkedin />, href: 'https://linkedin.com/company/learnos-ai', label: 'LinkedIn' },
        { icon: <Mail />, href: 'mailto:hello@learnos.ai', label: 'Email' },
    ];
    
    const footerLinks = {
        Platform: [
            { name: 'AI Voice Tutor', href: '/ai-tutor' },
            { name: 'Learning Modules', href: '/modules' },
            { name: 'Community', href: '/community' },
            { name: 'Dashboard', href: '/dashboard' },
        ],
        Features: [
            { name: 'Voice Learning', href: '/ai-tutor' },
            { name: 'Progress Tracking', href: '/dashboard' },
            { name: 'Study Groups', href: '/community' },
            { name: 'Achievements', href: '/dashboard' },
        ],
        Support: [
            { name: 'Help Center', href: '/help' },
            { name: 'Contact Us', href: '/contact' },
            { name: 'Documentation', href: '/docs' },
            { name: 'FAQ', href: '#faq-section' },
        ],
        Company: [
            { name: 'About LearnOS', href: '/about' },
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Careers', href: '/careers' },
        ],
    };

    const scrollToSection = (sectionId: string) => {
        if (sectionId.startsWith('#')) {
            const element = document.getElementById(sectionId.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <footer className="border-t border-border bg-background text-foreground py-12 relative z-10 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {/* Logo & Socials */}
                    <div className="col-span-2 md:col-span-2 pr-8">
                         <div className="flex items-center gap-2 mb-4">
                            <BrainCircuit className="text-creame" size={28} />
                            <h1 className="text-xl font-bold text-primary">LearnOS</h1>
                        </div>
                        <p className="text-foreground/80 mb-6">The ultimate AI-powered platform for modern learning.</p>
                        <div className="flex gap-4">
                            {socialLinks.map((link, i) => (
                                <a 
                                    key={i} 
                                    href={link.href} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-foreground/70 hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/20"
                                    title={link.label}
                                >
                                    {link.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                    {/* Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="font-semibold text-primary mb-4">{title}</h4>
                            <ul className="space-y-3">
                                {links.map(link => (
                                    <li key={link.name}>
                                        {link.href.startsWith('/') ? (
                                            <Link 
                                                href={link.href}
                                                className="text-foreground/70 hover:text-foreground transition-colors hover:underline"
                                            >
                                                {link.name}
                                            </Link>
                                        ) : link.href.startsWith('#') ? (
                                            <button
                                                onClick={() => scrollToSection(link.href)}
                                                className="text-foreground/70 hover:text-foreground transition-colors hover:underline text-left w-full"
                                            >
                                                {link.name}
                                            </button>
                                        ) : (
                                            <a 
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-foreground/70 hover:text-foreground transition-colors hover:underline"
                                            >
                                                {link.name}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-12 pt-8 border-t border-border text-center text-foreground/70 text-sm">
                    &copy; {new Date().getFullYear()} LearnOS. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
