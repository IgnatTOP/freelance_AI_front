/**
 * Hook for tracking active section during scroll
 */

"use client";

import { useState, useEffect, useCallback } from "react";

interface UseActiveSectionOptions {
  sections: string[]; // Array of section IDs to track (e.g., ["features", "pricing"])
  offset?: number; // Offset from top of viewport (default: 100)
  enabled?: boolean; // Enable/disable tracking (default: true)
}

export function useActiveSection({
  sections,
  offset = 100,
  enabled = true,
}: UseActiveSectionOptions) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleScroll = useCallback(() => {
    if (!enabled || sections.length === 0) {
      setActiveSection(null);
      return;
    }

    const scrollPosition = window.scrollY + offset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Check if at bottom of page
    const isAtBottom = scrollPosition + windowHeight >= documentHeight - 50;

    let currentSection: string | null = null;

    // Find the section that is currently in view
    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementBottom = elementTop + rect.height;

      // Section is active if scroll position is within its bounds
      if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
        currentSection = sectionId;
        break;
      }
    }

    // If at bottom of page and last section exists, make it active
    if (isAtBottom && !currentSection && sections.length > 0) {
      const lastSectionId = sections[sections.length - 1];
      const lastElement = document.getElementById(lastSectionId);
      if (lastElement) {
        currentSection = lastSectionId;
      }
    }

    setActiveSection(currentSection);
  }, [sections, offset, enabled]);

  useEffect(() => {
    if (!enabled) {
      setActiveSection(null);
      return;
    }

    // Initial check
    handleScroll();

    // Add scroll listener with passive option for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll, enabled]);

  return activeSection;
}
