"use client";

import { useResumeStore } from "@/lib/store";
import { ClassicTemplate } from "@/components/templates/classic";
import { ModernTemplate } from "@/components/templates/modern";
import { MinimalTemplate } from "@/components/templates/minimal";
import { GeekTemplate } from "@/components/templates/geek";
import { TemplateId } from "@/lib/types";
import { useEffect, useRef, useState, useCallback } from "react";

const templates: Record<TemplateId, React.ComponentType<{ data: any }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  geek: GeekTemplate,
};

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const PAGE_MARGIN = 16;

/**
 * Calculate page break positions.
 *
 * Two-layer strategy:
 *  1. Collect the top-edge of EVERY element as a potential break candidate.
 *     This means breaks always land between elements — never mid-text.
 *  2. For elements explicitly marked `break-inside: avoid` (or the legacy
 *     `page-break-inside: avoid`) that fit on one page, treat the whole
 *     element as a no-split zone: if a candidate falls inside it, push the
 *     break to just before the element instead.
 */
function calculatePageBreaks(
  container: HTMLElement,
  pageHeight: number
): number[] {
  const containerRect = container.getBoundingClientRect();
  const totalHeight = container.scrollHeight;

  // --- Layer 1: break candidates (element boundaries) ---
  const candidateSet = new Set<number>([0]);
  // --- Layer 2: protected ranges (breakInside: avoid) ---
  const avoidRanges: { top: number; bottom: number }[] = [];

  const allElements = container.getElementsByTagName("*");
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i] as HTMLElement;
    const rect = el.getBoundingClientRect();
    const top = rect.top - containerRect.top;
    const bottom = rect.bottom - containerRect.top;

    if (top > 0 && top < totalHeight) {
      candidateSet.add(Math.round(top));
    }

    const s = el.style;
    if (
      (s?.breakInside === "avoid" || s?.pageBreakInside === "avoid") &&
      bottom - top <= pageHeight
    ) {
      avoidRanges.push({ top, bottom });
    }
  }

  const candidates = [...candidateSet].sort((a, b) => a - b);

  // --- Walk pages ---
  const breaks = [0];
  let currentBreak = 0;

  while (currentBreak + pageHeight < totalHeight) {
    const target = currentBreak + pageHeight;

    // Find the last candidate at or before the target
    let brk = target;
    for (const c of candidates) {
      if (c > target) break;
      if (c > currentBreak) brk = c;
    }

    // If the chosen break lands inside a protected range, push it out
    for (const range of avoidRanges) {
      if (range.top > brk) break;
      if (range.bottom <= currentBreak) continue;
      if (range.top <= brk && range.bottom > brk && range.top > currentBreak) {
        brk = range.top;
        break;
      }
    }

    if (brk <= currentBreak) brk = target;

    breaks.push(brk);
    currentBreak = brk;
  }

  return breaks;
}

export function ResumePreview() {
  const { resumeData, templateId } = useResumeStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [totalHeight, setTotalHeight] = useState(PAGE_HEIGHT);
  const [pageBreaks, setPageBreaks] = useState<number[]>([0]);

  const Template = templates[templateId];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const containerWidth = container.clientWidth;
      const newScale = Math.min((containerWidth - 48) / PAGE_WIDTH, 1);
      setScale(newScale);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const measurePages = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;
    const h = el.scrollHeight;
    setTotalHeight(h);
    setPageBreaks(calculatePageBreaks(el, PAGE_HEIGHT));
  }, []);

  useEffect(() => {
    measurePages();
  }, [resumeData, templateId, measurePages]);

  const pageCount = pageBreaks.length;

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto bg-paper-dark flex flex-col items-center py-6 px-6 gap-8"
    >
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        className="invisible absolute top-0 left-0 overflow-hidden pointer-events-none"
        style={{ width: PAGE_WIDTH }}
      >
        <Template data={resumeData} />
      </div>

      {/* Visible pages */}
      {pageBreaks.map((breakStart, i) => {
        const breakEnd =
          i < pageCount - 1 ? pageBreaks[i + 1] : totalHeight;
        const isFirst = i === 0;
        const contentTop = isFirst ? 0 : PAGE_MARGIN;
        const cardHeight =
          PAGE_HEIGHT + (isFirst ? PAGE_MARGIN : 2 * PAGE_MARGIN);

        return (
          <div
            key={i}
            className="bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] shrink-0 relative overflow-hidden"
            style={{
              width: PAGE_WIDTH,
              height: cardHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              marginBottom: -cardHeight * (1 - scale),
            }}
          >
            {/* Content area with margin offset */}
            <div
              style={{
                position: "absolute",
                top: contentTop,
                left: 0,
                width: PAGE_WIDTH,
                height: breakEnd - breakStart,
                overflow: "hidden",
              }}
            >
              {/* Clipped template slice */}
              <div
                style={{
                  clipPath: `inset(${breakStart}px 0 ${Math.max(
                    0,
                    totalHeight - breakEnd
                  )}px 0)`,
                  top: -breakStart,
                  width: PAGE_WIDTH,
                  height: totalHeight,
                  position: "absolute",
                }}
              >
                <Template data={resumeData} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
