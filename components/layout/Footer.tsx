"use client";

import React from 'react';
import Link from 'next/link';
import { designTokens } from '@/lib/design-tokens';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Services',
      links: [
        { label: 'Dog Sitting', href: '/services/dog-sitting' },
        { label: 'Cat Sitting', href: '/services/cat-sitting' },
        { label: 'Dog Walking', href: '/services/dog-walking' },
        { label: 'Bird Sitting', href: '/services/bird-sitting' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Find Care', href: '/find-care' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
  ];

  const serviceAreas = [
    'Oshawa',
    'Ajax',
    'Bowmanville',
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container-modern py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Description */}
          <div className="flex items-center gap-3 min-w-[180px]">
            <img 
              src="/Petsitter-logo.png" 
              alt="Whiskarz Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xs text-gray-600 hidden sm:inline">
              Toronto's most trusted in-home pet care service.
            </span>
          </div>

          {/* Footer Links (flattened) */}
          <div className="flex flex-wrap gap-6">
            {footerLinks.flatMap(section => section.links).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-gray-600 hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Service Areas */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="text-xs font-semibold text-gray-900">Areas:</span>
            {serviceAreas.map(area => (
              <span key={area} className="text-xs text-gray-600">
                {area}
              </span>
            ))}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center gap-2 min-w-[180px]">
            <span className="text-xs text-gray-600">
              <span className="font-medium text-gray-900">Phone:</span> <a href="tel:+16475488025" className="hover:text-primary transition-colors">+1 (647) 548-8025</a>
            </span>
            <span className="text-xs text-gray-600">
              <span className="font-medium text-gray-900">Address:</span> 2191 Yonge St, Toronto
            </span>
          </div>

          {/* Legal & Social */}
          <div className="flex items-center gap-3 min-w-[120px]">
            <span className="text-xs text-gray-600">© {currentYear} Whiskarz</span>
            <Link href="/privacy" className="text-xs text-gray-600 hover:text-primary">Privacy</Link>
            <Link href="/terms" className="text-xs text-gray-600 hover:text-primary">Terms</Link>
            {/* Social icons (optional, compact) */}
            <a href="#" className="text-gray-400 hover:text-primary" aria-label="Facebook">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-primary" aria-label="Instagram">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-primary" aria-label="Twitter">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
