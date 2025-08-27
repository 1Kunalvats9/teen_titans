// src/components/landing/Footer.tsx
import React from 'react';
import { BrainCircuit, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer = () => {
    const socialLinks = [
        { icon: <Twitter />, href: '#' },
        { icon: <Github />, href: '#' },
        { icon: <Linkedin />, href: '#' },
    ];
    
    const footerLinks = {
        Product: ['Features', 'Pricing', 'Modules', 'Community'],
        Company: ['About Us', 'Careers', 'Contact'],
        Legal: ['Privacy Policy', 'Terms of Service'],
    };

    return (
        <footer className="border-t border-border bg-background text-foreground py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {/* Logo & Socials */}
                    <div className="col-span-2 md:col-span-2 pr-8">
                         <div className="flex items-center gap-2 mb-4">
                            <BrainCircuit className="text-creame" size={28} />
                            <h1 className="text-xl font-bold text-primary">LearnOS</h1>
                        </div>
                        <p className="text-muted-foreground mb-6">The ultimate AI-powered platform for modern learning.</p>
                        <div className="flex gap-4">
                            {socialLinks.map((link, i) => (
                                <a key={i} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
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
                                    <li key={link}>
                                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground text-sm">
                    &copy; {new Date().getFullYear()} LearnOS. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
