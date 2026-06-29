"use client";

import { useEffect, useRef, useState } from "react";
import { TEMPLATES } from "@/app/lib/templates";
import { renderStrip } from "@/app/lib/renderStrip";
import Photostrip from "@/app/components/Photostrip";

export default function Home() {
  const [screen, setScreen] = useState("select"); // 'select' | 'capture'
  const [template, setTemplate] = useState(null);
  const [photos, setPhotos] = useState([]);

  function chooseTemplate(t) {
    setTemplate(t);
    setPhotos([]);
    setScreen("capture");
  }

  function goBack() {
    setScreen("select");
    setTemplate(null);
    setPhotos([]);
  }

  return (
    <main className="page">
      <header className="header">
        <h1 className="brand">📸 Photobooth</h1>
        <p className="tagline">Pick a cute strip, strike a pose, take it home ✨</p>
      </header>

      {screen === "select" ? (
        <SelectScreen onChoose={chooseTemplate} />
      ) : (
        <CaptureScreen
          template={template}
          photos={photos}
          setPhotos={setPhotos}
          onBack={goBack}
        />
      )}
    </main>
  );
}

/* ------------------------------- Select ---------------------------------- */

function SelectScreen({ onChoose }) {
  return (
    <section>
      <h2 className="section-title">Choose your template</h2>
      <div className="template-grid">
        {TEMPLATES.map((t) => (
          <button key={t.id} className="template-card" onClick={() => onChoose(t)}>
            <div className="thumb-wrap">
              <Photostrip
                template={t}
                photos={[]}
                scale={2}
                style={{ width: 130, height: "auto", display: "block" }}
              />
            </div>
            <span className="template-name">{t.name}</span>
            <span className="template-meta">
              {t.slots.length} photos · 2&quot;×6&quot;
            </span>
            <span className="use-btn" style={{ background: t.accent }}>
              Use this 💕
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- Capture --------------------------------- */

function CaptureScreen({ template, photos, setPhotos, onBack }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0); // countdown number (0 = idle)

  const total = template.slots.length;
  const done = photos.length >= total;

  // start / stop camera
  useEffect(() => {
    let stream;
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setReady(true);
        }
      } catch (e) {
        setError("Could not access the camera. Please allow camera permission.");
      }
    }
    start();
    return () => stream && stream.getTracks().forEach((t) => t.stop());
  }, []);

  function snap() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // mirror to match the preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotos((prev) => [...prev, canvas.toDataURL("image/jpeg", 0.9)]);
  }

  function startCountdown() {
    if (!ready || done || count > 0) return;
    let n = 3;
    setCount(n);
    const timer = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(timer);
        setCount(0);
        snap();
      } else {
        setCount(n);
      }
    }, 1000);
  }

  async function download() {
    const c = document.createElement("canvas");
    await renderStrip(c, template, photos, { scale: 4 });
    c.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `photostrip-${template.id}.png`;
        a.click();
        URL.revokeObjectURL(url);
      },
      "image/png"
    );
  }

  return (
    <section className="capture">
      <div className="capture-bar">
        <button className="ghost-btn" onClick={onBack}>
          ← Templates
        </button>
        <span className="capture-title">{template.name}</span>
        <span className="capture-progress">
          {Math.min(photos.length, total)}/{total}
        </span>
      </div>

      <div className="capture-grid">
        {/* Camera */}
        <div className="camera-col">
          <div className="camera-frame" style={{ "--accent": template.accent }}>
            <span className="cam-corner tl">✿</span>
            <span className="cam-corner tr">✿</span>
            <span className="cam-corner bl">✿</span>
            <span className="cam-corner br">✿</span>
            {error ? (
              <div className="cam-error">{error}</div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
            )}
            {count > 0 && <div className="countdown">{count}</div>}
            <span className="cam-badge">● LIVE</span>
          </div>

          {!done ? (
            <button
              className="snap-btn"
              style={{ background: template.accent }}
              onClick={startCountdown}
              disabled={!ready || count > 0}
            >
              {count > 0 ? "Smile! 😊" : `📸 Take photo ${photos.length + 1}`}
            </button>
          ) : (
            <div className="done-actions">
              <button
                className="snap-btn"
                style={{ background: template.accent }}
                onClick={download}
              >
                ⬇ Download strip
              </button>
              <button className="ghost-btn wide" onClick={() => setPhotos([])}>
                ↺ Retake
              </button>
            </div>
          )}
          {done && <p className="done-note">All set! 🎉 Save your strip below the camera.</p>}
        </div>

        {/* Live strip preview */}
        <div className="strip-col">
          <Photostrip
            template={template}
            photos={photos}
            scale={3}
            style={{ width: 200, height: "auto", display: "block" }}
          />
        </div>
      </div>
    </section>
  );
}
