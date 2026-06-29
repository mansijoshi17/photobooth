"use client";

import { useEffect, useRef, useState } from "react";
import { TEMPLATES } from "@/app/lib/templates";
import { renderStrip } from "@/app/lib/renderStrip";
import Photostrip from "@/app/components/Photostrip";
import StripEditor from "@/app/components/StripEditor";

let UID = 1;
const withIds = (decos) => decos.map((d) => ({ ...d, id: UID++ }));

// Instagram / Facebook / TikTok etc. in-app browsers block downloads and the
// Web Share API. Detect them so we can ask the user to open in a real browser.
function detectInAppBrowser() {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  if (/Messenger/i.test(ua)) return "Messenger";
  if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) return "TikTok";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  if (/Line\//i.test(ua)) return "LINE";
  return null;
}

export default function Home() {
  const [screen, setScreen] = useState("select"); // 'select' | 'capture'
  const [template, setTemplate] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [decorations, setDecorations] = useState([]);
  const [inApp, setInApp] = useState(null);

  useEffect(() => {
    setInApp(detectInAppBrowser());
  }, []);

  function chooseTemplate(t) {
    setTemplate(t);
    setPhotos([]);
    setDecorations(withIds(t.decorations));
    setScreen("capture");
  }

  function goBack() {
    setScreen("select");
    setTemplate(null);
    setPhotos([]);
    setDecorations([]);
  }

  return (
    <main className="page">
      <header className="header">
        <h1 className="brand">
          <img src="/photobooth-logo.png" alt="" className="brand-logo" />
          <span className="brand-text">Photobooth</span>
        </h1>
        <p className="tagline">Pick a cute strip, strike a pose, decorate & download ✨</p>
      </header>

      {inApp && (
        <div className="inapp-banner" role="alert">
          <span>
            You opened this inside {inApp}. Downloads don’t work here — tap the{" "}
            <strong>•••</strong> menu and choose{" "}
            <strong>“Open in browser”</strong> (Safari/Chrome) to save your strip.
          </span>
          <button
            type="button"
            className="inapp-dismiss"
            aria-label="Dismiss"
            onClick={() => setInApp(null)}
          >
            ✕
          </button>
        </div>
      )}

      {screen === "select" ? (
        <SelectScreen onChoose={chooseTemplate} />
      ) : (
        <CaptureScreen
          template={template}
          photos={photos}
          setPhotos={setPhotos}
          decorations={decorations}
          setDecorations={setDecorations}
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
            <span className="use-btn" style={{ background: t.accent }}>
              {t.cta || "Use this 💕"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- Capture --------------------------------- */

function CaptureScreen({ template, photos, setPhotos, decorations, setDecorations, onBack }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const total = template.slots.length;
  const done = photos.length >= total;

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
      } else setCount(n);
    }, 1000);
  }

  async function download() {
    const c = document.createElement("canvas");
    await renderStrip(c, template, photos, { scale: 4, decorations });

    const blob = await new Promise((resolve) =>
      c.toBlob(resolve, "image/png")
    );
    if (!blob) return;

    const filename = `photostrip-${template.id}.png`;

    // On mobile (esp. iOS Safari) the <a download> trick is unreliable —
    // the Web Share API lets the user save to Photos / share instead.
    const file = new File([blob], filename, { type: "image/png" });
    if (
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (err) {
        // user cancelled the share sheet, or it failed — fall through to download
        if (err?.name === "AbortError") return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    // Keep the blob URL alive long enough for the browser to start the download.
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 4000);
  }

  // sticker controls
  const updateSelected = (fn) =>
    setDecorations((prev) => prev.map((d) => (d.id === selectedId ? fn(d) : d)));
  const addSticker = (src) => {
    const id = UID++;
    setDecorations((prev) => [...prev, { src, x: 150, y: 300, size: 50, rot: 0, id }]);
    setSelectedId(id);
  };
  const removeSelected = () => {
    setDecorations((prev) => prev.filter((d) => d.id !== selectedId));
    setSelectedId(null);
  };

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
              <button className="snap-btn" style={{ background: template.accent }} onClick={download}>
                ⬇ Download strip
              </button>
              <button className="ghost-btn wide" onClick={() => setPhotos([])}>
                ↺ Retake photos
              </button>
            </div>
          )}
          <p className="hint">✨ Drag stickers on the strip to place them. Tap one to resize, rotate or remove.</p>
        </div>

        {/* Editable strip */}
        <div className="strip-col">
          {/* toolbar for the selected sticker */}
          <div className={"sticker-toolbar" + (selectedId ? " active" : "")}>
            <button onClick={() => updateSelected((d) => ({ ...d, size: Math.max(14, d.size / 1.15) }))} title="Smaller">－</button>
            <button onClick={() => updateSelected((d) => ({ ...d, size: Math.min(170, d.size * 1.15) }))} title="Bigger">＋</button>
            <button onClick={() => updateSelected((d) => ({ ...d, rot: (d.rot || 0) - Math.PI / 12 }))} title="Rotate left">↺</button>
            <button onClick={() => updateSelected((d) => ({ ...d, rot: (d.rot || 0) + Math.PI / 12 }))} title="Rotate right">↻</button>
            <button className="del" onClick={removeSelected} title="Remove">🗑</button>
          </div>

          <StripEditor
            template={template}
            photos={photos}
            decorations={decorations}
            setDecorations={setDecorations}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            width={236}
          />

          {/* sticker tray */}
          <div className="sticker-tray">
            {(template.palette || []).map((src, i) => (
              <button key={i} className="tray-item" onClick={() => addSticker(src)} title="Add sticker">
                <img src={src} alt="" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
