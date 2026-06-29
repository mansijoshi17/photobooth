"use client";

import { useRef } from "react";
import Photostrip from "./Photostrip";
import { STRIP_W, STRIP_H } from "@/app/lib/templates";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function StripEditor({
  template,
  photos,
  decorations,
  setDecorations,
  selectedId,
  setSelectedId,
  width = 230,
}) {
  const scale = width / STRIP_W; // display px per design unit
  const height = STRIP_H * scale;
  const drag = useRef(null);

  function onPointerDown(e, d) {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedId(d.id);
    drag.current = { id: d.id, sx: e.clientX, sy: e.clientY, ox: d.x, oy: d.y };
  }

  function onPointerMove(e) {
    const g = drag.current;
    if (!g) return;
    const dx = (e.clientX - g.sx) / scale;
    const dy = (e.clientY - g.sy) / scale;
    setDecorations((prev) =>
      prev.map((p) =>
        p.id === g.id
          ? { ...p, x: clamp(g.ox + dx, 0, STRIP_W), y: clamp(g.oy + dy, 0, STRIP_H) }
          : p
      )
    );
  }

  function onPointerUp() {
    drag.current = null;
  }

  return (
    <div
      className="strip-editor"
      style={{ width, height }}
      onPointerDown={() => setSelectedId(null)}
    >
      <Photostrip
        template={template}
        photos={photos}
        scale={3}
        skipDecorations
        style={{ width: "100%", height: "100%", display: "block", borderRadius: 14 }}
      />
      {decorations.map((d) => (
        <img
          key={d.id}
          src={d.src}
          alt=""
          draggable={false}
          onPointerDown={(e) => onPointerDown(e, d)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={"deco" + (selectedId === d.id ? " selected" : "")}
          style={{
            left: d.x * scale,
            top: d.y * scale,
            width: d.size * scale,
            transform: `translate(-50%, -50%) rotate(${d.rot || 0}rad)`,
          }}
        />
      ))}
    </div>
  );
}
