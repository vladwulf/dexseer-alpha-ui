import { useEffect, useState } from "react";

export const useOneWayScrollLock = () => {
  const [hasScrolledPast, setHasScrolledPast] = useState(false);

  // Handle beforeunload to ensure scroll resets on page reload/navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      setHasScrolledPast(false);
      window.scrollTo(0, 0);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Once we've scrolled past the header (100vh), hide it permanently
      if (scrollY >= viewportHeight && !hasScrolledPast) {
        setHasScrolledPast(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolledPast]);

  return hasScrolledPast;
};
