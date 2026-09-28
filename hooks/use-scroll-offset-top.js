'use client';

import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useRef, useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export function useScrollOffSetTop(top = 0) {
  const elementRef = useRef(null);
  const isOffsetRef = useRef(false);

  const { scrollY } = useScroll();

  const [offsetTop, setOffsetTop] = useState(false);

  const handleScrollChange = useCallback(
    (val) => {
      const scrollHeight = Math.round(val);
      let isTop = false;

      if (elementRef?.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const elementTop = Math.round(rect.top);
        isTop = elementTop < top;
      } else {
        isTop = scrollHeight > top;
      }

      if (isOffsetRef.current !== isTop) {
        isOffsetRef.current = isTop;
        setOffsetTop(isTop);
      }
    },
    [elementRef, top]
  );

  useMotionValueEvent(
    scrollY,
    'change',
    useMemo(() => handleScrollChange, [handleScrollChange])
  );

  const memoizedValue = useMemo(() => ({ elementRef, offsetTop }), [offsetTop]);

  return memoizedValue;
}
