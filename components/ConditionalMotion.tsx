'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps, SVGMotionProps } from 'framer-motion';
import { useReducedMotion as useReducedMotionHook } from '@/lib/hooks/useReducedMotion';

// Re-export for convenience
export { useReducedMotion, usePerformanceTier, useMotionContext } from '@/lib/hooks/useReducedMotion';

type MotionComponentType = 
  | 'div' 
  | 'span' 
  | 'section' 
  | 'article' 
  | 'button' 
  | 'a' 
  | 'ul' 
  | 'li' 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6' 
  | 'p';

type ConditionalMotionProps<T extends MotionComponentType> = 
  HTMLMotionProps<T> & { as?: T; fallbackClassName?: string };

/**
 * ConditionalMotion component that renders motion.* when animations are enabled,
 * and plain HTML elements when reduced motion is preferred.
 * 
 * This prevents the overhead of framer-motion when animations are disabled.
 */
function ConditionalMotionInner<T extends MotionComponentType = 'div'>(
  props: ConditionalMotionProps<T>,
  ref: React.Ref<any>
) {
  const shouldReduceMotion = useReducedMotionHook();
  const { as = 'div' as T, fallbackClassName, ...restProps } = props;

  if (shouldReduceMotion) {
    // Remove all animation props when reduced motion is active
    const {
      initial,
      animate,
      exit,
      transition,
      variants,
      whileHover,
      whileTap,
      whileFocus,
      whileInView,
      whileDrag,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      dragTransition,
      onDrag,
      onDragStart,
      onDragEnd,
      viewport,
      layout,
      layoutId,
      ...cleanProps
    } = restProps as any;

    // Merge fallbackClassName with existing className if provided
    if (fallbackClassName && cleanProps.className) {
      cleanProps.className = `${cleanProps.className} ${fallbackClassName}`;
    } else if (fallbackClassName) {
      cleanProps.className = fallbackClassName;
    }

    // Return plain HTML element
    return React.createElement(as, { ...cleanProps, ref });
  }

  // Return motion component with all props
  const MotionComponent = motion[as as keyof typeof motion] as any;
  return <MotionComponent ref={ref} {...restProps} />;
}

// Type-safe forwardRef wrapper
export const ConditionalMotion = forwardRef(ConditionalMotionInner) as <T extends MotionComponentType = 'div'>(
  props: ConditionalMotionProps<T> & { ref?: React.Ref<any> }
) => React.ReactElement;

/**
 * Specific motion component wrappers for common use cases
 */
export const ConditionalMotionDiv = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>((props, ref) => (
  <ConditionalMotion as="div" ref={ref} {...props} />
));
ConditionalMotionDiv.displayName = 'ConditionalMotionDiv';

export const ConditionalMotionSpan = forwardRef<HTMLSpanElement, HTMLMotionProps<'span'>>((props, ref) => (
  <ConditionalMotion as="span" ref={ref} {...props} />
));
ConditionalMotionSpan.displayName = 'ConditionalMotionSpan';

export const ConditionalMotionButton = forwardRef<HTMLButtonElement, HTMLMotionProps<'button'>>((props, ref) => (
  <ConditionalMotion as="button" ref={ref} {...props} />
));
ConditionalMotionButton.displayName = 'ConditionalMotionButton';

export const ConditionalMotionSection = forwardRef<HTMLElement, HTMLMotionProps<'section'>>((props, ref) => (
  <ConditionalMotion as="section" ref={ref} {...props} />
));
ConditionalMotionSection.displayName = 'ConditionalMotionSection';

/**
 * Helper hook to get animation variants based on reduced motion preference
 * Returns empty object if reduced motion is active, otherwise returns the variants
 */
export function useConditionalVariants<T extends Record<string, any>>(variants: T): T | {} {
  const shouldReduceMotion = useReducedMotionHook();
  return shouldReduceMotion ? {} : variants;
}

/**
 * Helper hook to get transition config based on reduced motion preference
 * Returns instant transition if reduced motion is active
 */
export function useConditionalTransition(transition: any): any {
  const shouldReduceMotion = useReducedMotionHook();
  return shouldReduceMotion ? { duration: 0 } : transition;
}

/**
 * Higher-order component to wrap AnimatePresence conditionally
 * When reduced motion is active, it renders children directly without AnimatePresence
 */
export function ConditionalAnimatePresence({ 
  children,
  ...props 
}: React.ComponentProps<typeof import('framer-motion').AnimatePresence>) {
  const shouldReduceMotion = useReducedMotionHook();
  
  if (shouldReduceMotion) {
    // Just render children without AnimatePresence
    return <>{children}</>;
  }

  const { AnimatePresence } = require('framer-motion');
  return <AnimatePresence {...props}>{children}</AnimatePresence>;
}

