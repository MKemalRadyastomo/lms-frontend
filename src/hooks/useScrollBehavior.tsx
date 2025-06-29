"use client";

import { useEffect, useState, useCallback } from 'react';

interface ScrollBehavior {
  isScrolled: boolean;
  isScrollingUp: boolean;
  isScrollingDown: boolean;
  scrollY: number;
  isHeaderVisible: boolean;
}

interface UseScrollBehaviorOptions {
  threshold?: number;
  hideOnScrollDown?: boolean;
  showOnScrollUp?: boolean;
  debounceMs?: number;
}

export function useScrollBehavior(options: UseScrollBehaviorOptions = {}): ScrollBehavior {
  const {
    threshold = 10,
    hideOnScrollDown = true,
    showOnScrollUp = true,
    debounceMs = 10
  } = options;

  const [scrollState, setScrollState] = useState<ScrollBehavior>({
    isScrolled: false,
    isScrollingUp: false,
    isScrollingDown: false,
    scrollY: 0,
    isHeaderVisible: true,
  });

  const [lastScrollY, setLastScrollY] = useState(0);
  const [ticking, setTicking] = useState(false);

  const updateScrollState = useCallback(() => {
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY;
    
    // Determine scroll direction
    const isScrollingUp = deltaY < -threshold;
    const isScrollingDown = deltaY > threshold;
    const isScrolled = currentScrollY > threshold;

    // Determine header visibility
    let isHeaderVisible = true;
    
    if (hideOnScrollDown && isScrollingDown && currentScrollY > 100) {
      isHeaderVisible = false;
    } else if (showOnScrollUp && isScrollingUp) {
      isHeaderVisible = true;
    } else if (currentScrollY <= threshold) {
      isHeaderVisible = true;
    }

    setScrollState({
      isScrolled,
      isScrollingUp,
      isScrollingDown,
      scrollY: currentScrollY,
      isHeaderVisible,
    });

    setLastScrollY(currentScrollY);
    setTicking(false);
  }, [lastScrollY, threshold, hideOnScrollDown, showOnScrollUp]);

  const requestTick = useCallback(() => {
    if (!ticking) {
      setTicking(true);
      requestAnimationFrame(updateScrollState);
    }
  }, [ticking, updateScrollState]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(requestTick, debounceMs);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initialize scroll state
    updateScrollState();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [requestTick, updateScrollState, debounceMs]);

  return scrollState;
}

export default useScrollBehavior;
