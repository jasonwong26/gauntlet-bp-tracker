import { useEffect, useRef } from 'react';

type Handler = (...args: any[]) => void;

/**
 * React Hook wrapper for setInterval function.
 *
 * @param callback function to execute after delay
 * @param delay millisecond delay
 *
 * @version 16.8.0
 * @see https://reactjs.org/docs/hooks-reference.html#useeffect
 */
export function useInterval(callback: Handler, delay: number) {
  const savedCallback = useRef<Handler>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current!();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }

    return undefined;
  }, [delay]);
};
