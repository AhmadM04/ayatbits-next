'use client';

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-800/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-green-500">
            AyatBits
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                  Log In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  Get Started
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800/50">
            <nav className="flex flex-col gap-4">
              <Link href="#features" className="text-sm text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                Features
              </Link>
              <Link href="/pricing" className="text-sm text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                Pricing
              </Link>
              <div className="flex gap-3 pt-4 border-t border-gray-800/50">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm" className="flex-1 text-gray-400">Log In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">Get Started</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="flex-1">
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">Dashboard</Button>
                  </Link>
                </SignedIn>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
