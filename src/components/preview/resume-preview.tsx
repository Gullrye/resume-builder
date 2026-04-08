"use client";

import { useResumeStore } from "@/lib/store";
import { ModernTemplate } from "@/components/templates/modern";
import { GeekTemplate } from "@/components/templates/geek";
import { TemplateId } from "@/lib/types";
import { useEffect, useRef, useState, useCallback } from "react";

const templates: Record<TemplateId, React.ComponentType<{ data: any }>> = {
  modern: ModernTemplate,
  geek: GeekTemplate,
};

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const PAGE_MARGIN = 8;

/**
 * Calculate page break positions.
 *
 * Three-layer strategy:
 *  1. Collect the top-edge of EVERY element as a potential break candidate.
 *  2. Collect text line boundaries via Range.getClientRects() for line-level
 *     granularity inside elements (e.g. long <li> with wrapped text).
 *  3. For elements explicitly marked `break-inside: avoid` that fit on one
 *     page, treat the whole element as a no-split zone: if a candidate falls
 *     inside it, push the break to just before the element instead.
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

    // Collect line-level break candidates from text nodes
    if (el.childNodes.length > 0) {
      collectLineCandidates(el, containerRect, totalHeight, candidateSet);
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

/**
 * Use Range.getClientRects() to find text line boundaries inside an element,
 * adding each line top as a break candidate for fine-grained page breaks.
 */
function collectLineCandidates(
  el: HTMLElement,
  containerRect: DOMRect,
  totalHeight: number,
  candidateSet: Set<number>
) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const nodeTexts: { node: Text; start: number }[] = [];

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (node.textContent && node.textContent.trim()) {
      nodeTexts.push({ node, start: 0 });
    }
  }

  for (const { node: textNode } of nodeTexts) {
    const len = textNode.textContent!.length;
    // Use word-level ranges to find line boundaries
    range.setStart(textNode, 0);
    range.setEnd(textNode, len);
    const rects = range.getClientRects();

    const seenTops = new Set<number>();
    for (let r = 0; r < rects.length; r++) {
      const lineTop = Math.round(rects[r].top - containerRect.top);
      // Deduplicate (multiple rects can share the same top)
      if (lineTop > 0 && lineTop < totalHeight && !seenTops.has(lineTop)) {
        seenTops.add(lineTop);
        candidateSet.add(lineTop);
      }
    }
  }
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
      const pad = containerWidth < 768 ? 24 : 48;
      const newScale = Math.min((containerWidth - pad) / PAGE_WIDTH, 1);
      setScale(newScale);
      // Re-measure pages — needed when container transitions from display:none to visible
      const el = measureRef.current;
      if (el) {
        const h = el.scrollHeight;
        if (h > 0) {
          setTotalHeight(h);
          setPageBreaks(calculatePageBreaks(el, PAGE_HEIGHT));
        }
      }
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
      className="h-full overflow-y-auto overflow-x-hidden bg-paper-dark flex flex-col items-center py-4 md:py-6 px-3 md:px-6 gap-3"
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
        // Clip exactly at the break point (element boundary) to avoid cutting text
        const visibleHeight = Math.min(PAGE_HEIGHT, breakEnd - breakStart);
        const paddedHeight = Math.max(totalHeight, breakStart + PAGE_HEIGHT);
        const clipBottom = paddedHeight - breakStart - visibleHeight;

        return (
          <div
            key={i}
            className="shadow-[0_2px_20px_rgba(0,0,0,0.06)] shrink-0 relative overflow-hidden"
            style={{
              width: PAGE_WIDTH,
              height: cardHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              marginBottom: -cardHeight * (1 - scale),
              background:
                templateId === "modern"
                  ? "linear-gradient(to right, #2D3748 30%, white 30%)"
                  : "white",
            }}
          >
            {/* Content area with margin offset */}
            <div
              style={{
                position: "absolute",
                top: contentTop,
                left: 0,
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                overflow: "hidden",
              }}
            >
              {/* Clipped template slice */}
              <div
                style={{
                  clipPath: `inset(${breakStart}px 0 ${clipBottom}px 0)`,
                  top: -breakStart,
                  width: PAGE_WIDTH,
                  height: paddedHeight,
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
