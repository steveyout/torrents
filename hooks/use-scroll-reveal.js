'use client';

import { useRef, useState, useEffect } from 'react';

// Singleton IntersectionObserver for high performance across all cards
let sharedObserver = null;
const callbacks = new Map();

function getSharedObserver() {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return null;
  }

  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cb = callbacks.get(entry.target);
            if (cb) {
              cb(true);
              callbacks.delete(entry.target);
              sharedObserver.unobserve(entry.target);
            }
          }
        });
      },
      {
        // 40px bottom margin so cards start revealing slightly before entering view;
        // 80px horizontal margin so cards in mobile horizontal sliders reveal smoothly before swipe
        rootMargin: '40px 80px 40px 80px',
        threshold: 0.01,
      }
    );
  }

  return sharedObserver;
}

export function useScrollReveal() {
  const elementRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return undefined;

    const observer = getSharedObserver();
    if (!observer) {
      setInView(true);
      return undefined;
    }

    callbacks.set(el, (intersecting) => {
      setInView(intersecting);
    });

    observer.observe(el);

    return () => {
      callbacks.delete(el);
      if (observer) {
        observer.unobserve(el);
      }
    };
  }, []);

  return { elementRef, inView };
}
