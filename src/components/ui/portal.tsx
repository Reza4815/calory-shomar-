"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into document.body.
 * Overlays (dialogs, bottom sheets) must live outside the bottom-nav capsule:
 * .frame-fixed uses transform: translateX(-50%), which turns every nested
 * `position: fixed` element into a view of the nav strip instead of the
 * viewport — clipping the floating action menu and opening sheets.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => setContainer(document.body), []);

  if (!container) return null;
  return createPortal(children, container);
}
