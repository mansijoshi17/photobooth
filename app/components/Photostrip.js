"use client";

import { useEffect, useRef } from "react";
import { renderStrip } from "@/app/lib/renderStrip";

export default function Photostrip({ template, photos = [], scale = 3, style, className }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      renderStrip(ref.current, template, photos, { scale }).catch(() => {});
    }
  }, [template, photos, scale]);

  return <canvas ref={ref} style={style} className={className} />;
}
