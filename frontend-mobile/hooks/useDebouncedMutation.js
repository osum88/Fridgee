import { useRef, useCallback } from "react";

export const useDebouncedMutation = (defaultDelay = 1000) => {
  const debounceTimeoutRef = useRef({});

  const debouncedMutate = useCallback(
    (mutation, key = "default", variables = {}, delay = defaultDelay) => {
      if (!mutation || typeof mutation.mutate !== "function") return;

      // vymaze předchozí timeout pro tento klic
      if (debounceTimeoutRef.current[key]) {
        clearTimeout(debounceTimeoutRef.current[key]);
      }

      debounceTimeoutRef.current[key] = setTimeout(() => {
        mutation.mutate(variables);
        debounceTimeoutRef.current[key] = null;
      }, delay);
    },
    [defaultDelay]
  );

  return debouncedMutate;
};

