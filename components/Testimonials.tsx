'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  name: string;
  username: string;
  initial: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Fatima Hassan',
    username: '@fatimahquran',
    initial: 'F',
    quote: 'The best way to memorize and understand the Quran. The puzzle format makes learning so much fun and effective!',
  },
  {
    name: 'Ahmed Ali',
    username: '@ahmedquran',
    initial: 'A',
    quote: 'I\'ve tried many methods, but AyatBits makes memorization engaging. The streak feature keeps me motivated daily.',
  },
  {
    name: 'Sara Ibrahim',
    username: '@saraquran',
    initial: 'S',
    quote: 'The multiple translations feature is amazing! I can learn in my native language and switch anytime. Highly recommend!',
  },
  {
    name: 'Omar Khan',
    username: '@omarkhan',
    initial: 'O',
    quote: 'As a teacher, I recommend this to all my students. The interactive puzzles make learning accessible and enjoyable.',
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-[var(--background)] overflow-hidden transition-colors duration-300">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(34, 197, 94, 0.1) 20px, rgba(34, 197, 94, 0.1) 40px)`,
        }}></div>
      </div>

      <div className="relative z-10 text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          What Our Users Say
        </h2>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
          Join thousands of learners mastering the Quran
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-[var(--bg-card)] dark:bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-[var(--border-color)] shadow-2xl transition-colors duration-300"
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {testimonials[currentIndex].initial}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                    {testimonials[currentIndex].name}
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm">
                    {testimonials[currentIndex].username}
                  </p>
                </div>
                <p className="text-[var(--text-primary)] italic text-lg leading-relaxed">
                  "{testimonials[currentIndex].quote}"
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-green-500 w-8'
                  : 'bg-[var(--text-muted)] hover:bg-[var(--text-secondary)] w-2'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

