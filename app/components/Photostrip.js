"use client";

import { useEffect, useRef } from "react";
import { renderStrip } from "@/app/lib/renderStrip";

export default function Photostrip({
  template,
  photos = [],
  scale = 3,
  skipDecorations = false,
  decorations,
  style,
  className,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      renderStrip(ref.current, template, photos, {
        scale,
        skipDecorations,
        decorations,
      }).catch(() => {});
    }
  }, [template, photos, scale, skipDecorations, decorations]);

  return <canvas ref={ref} style={style} className={className} />;
}
