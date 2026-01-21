import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue, callback) {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const value = JSON.parse(item);
        setStoredValue(value);
        callback?.(value);
      } else {
        callback?.();
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Error reading localStorage key "${key}":`, error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Only re-run if key changes

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }
  };

  return [storedValue, setValue];
}
