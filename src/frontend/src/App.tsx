import { useCallback, useEffect, useRef, useState } from "react";

// ========== TYPES ==========
interface HeartParticle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  emoji: string;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

// ========== CONSTANTS ==========
const NO_PHRASES = [
  "Really🤷🏻?",
  "Try again!",
  "Are you sure🤦🏻?",
  "Haha nice try💁🏻!",
  "No escape🙅🏻!",
  "Still no 🙂‍↔️? Really😏?",
  "You can't escape love 🤍!",
  "You are testing my patience😜!",
  "Try again buddy🫠!",
  "Come on Sakshi click on yes💌!!",
  "Love always wins ❤️!!!",
  "Keep trying😎!",
  "Not today😤!",
  "Why again🙍🏻?",
];

const CONFETTI_COLORS = [
  "#FF6B8A",
  "#FF1744",
  "#F48FB1",
  "#E91E63",
  "#FF69B4",
  "#C2185B",
];
const HEART_EMOJIS = ["❤️", "🩷", "💕", "💗", "💖", "💝"];

const SONG_SRC =
  "/assets/a.r._rahman_javed_ali_-_tum_tak_lyrics_256k-019d5daa-0c87-700c-89e9-5e4eb0324873.mp3";

// ========== SPLASH / TAP-TO-BEGIN OVERLAY ==========
function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <button
      type="button"
      onClick={onStart}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(rgba(246, 240, 230, 0.55), rgba(239, 162, 170, 0.65)), url('/assets/generated/couple-hugging.dim_1920x1080.jpg') center/cover no-repeat",
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        gap: "20px",
        border: "none",
        outline: "none",
        padding: 0,
        margin: 0,
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label="Tap to begin"
    >
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "clamp(1.1rem, 4vw, 1.5rem)",
          color: "#5A2E23",
          textAlign: "center",
          padding: "0 24px",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        A special surprise awaits you, Sakshi...
      </p>
      <p
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontWeight: 700,
          fontSize: "clamp(1.3rem, 5vw, 1.8rem)",
          color: "#8C2B52",
          animation: "splashPulse 1.5s ease-in-out infinite 0.4s",
          margin: 0,
        }}
      >
        Tap anywhere to begin ✨
      </p>
    </button>
  );
}

// ========== MUSIC PLAYER HOOK ==========
function useBgMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(SONG_SRC);
    audio.loop = true;
    audio.volume = 0.65;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const startMusic = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => {});
  }, []);

  return { startMusic };
}

// ========== FLOATING HEARTS COMPONENT ==========
function FloatingHearts() {
  const [hearts] = useState<HeartParticle[]>(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 14 + Math.random() * 14,
      delay: Math.random() * 8,
      duration: 7 + Math.random() * 6,
      emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
    })),
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {hearts.map((heart) => (
        <span
          key={heart.id}
          style={{
            position: "absolute",
            left: `${heart.left}%`,
            bottom: "-20px",
            fontSize: `${heart.size}px`,
            animation: `floatUp ${heart.duration}s ${heart.delay}s infinite ease-in-out`,
            willChange: "transform, opacity",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {heart.emoji}
        </span>
      ))}
    </div>
  );
}

// ========== HEART CONFETTI CANVAS ==========
function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  opacity: number,
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(size / 30, size / 30);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-2, -4, -10, -4, -10, 4);
  ctx.bezierCurveTo(-10, 10, 0, 16, 0, 16);
  ctx.bezierCurveTo(0, 16, 10, 10, 10, 4);
  ctx.bezierCurveTo(10, -4, 2, -4, 0, 0);
  ctx.fill();
  ctx.restore();
}

function HeartConfetti({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);

  const initParticles = useCallback(() => {
    const count = 90;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 80,
      vx: -3 + Math.random() * 6,
      vy: 3 + Math.random() * 6,
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 12 + Math.random() * 16,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: -0.05 + Math.random() * 0.1,
      opacity: 0.9 + Math.random() * 0.1,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeCount = 0;
      for (const p of particlesRef.current) {
        if (p.y < canvas.height + 50) {
          activeCount++;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.06;
          p.rotation += p.rotationSpeed;
          const fadeStart = 3000;
          if (elapsed > fadeStart) {
            p.opacity = Math.max(0, p.opacity - 0.012);
          }
          drawHeart(ctx, p.x, p.y, p.size, p.rotation, p.color, p.opacity);
        }
      }

      if (elapsed < 5000 || activeCount > 0) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [initParticles, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}

// ========== YES DIALOG ==========
function YesDialog({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    // Backdrop — tap to dismiss early
    <button
      type="button"
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === "Escape") onDismiss();
      }}
      tabIndex={-1}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(90, 46, 35, 0.45)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        animation: "dialogFadeIn 0.35s ease forwards",
        padding: "20px",
        cursor: "default",
        border: "none",
        outline: "none",
      }}
      data-ocid="birthday.dialog"
      aria-label="Dismiss dialog"
    >
      {/* Card — use native dialog for semantics, stop click from reaching backdrop */}
      <dialog
        open
        aria-label="Great choice message"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        style={{
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "28px",
          padding: "40px 36px 44px",
          maxWidth: "420px",
          width: "100%",
          boxShadow:
            "0 24px 64px rgba(140, 43, 82, 0.28), 0 4px 20px rgba(192, 68, 106, 0.18)",
          border: "1px solid rgba(181, 106, 122, 0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          textAlign: "center",
          animation:
            "dialogSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          position: "relative",
          margin: 0,
        }}
      >
        {/* Pulsing heart */}
        <div
          aria-hidden="true"
          style={{
            fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
            animation: "heartBeat 0.9s ease-in-out infinite",
            lineHeight: 1,
          }}
        >
          💖
        </div>

        {/* Message */}
        <p
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontWeight: 700,
            fontSize: "clamp(1.45rem, 4.5vw, 2rem)",
            color: "#8C2B52",
            lineHeight: 1.45,
            margin: 0,
          }}
        >
          Great choice ! Now, wait I have something for you !!
        </p>

        {/* Subtle loading dots */}
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginTop: "4px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#B56A7A",
                animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                display: "inline-block",
              }}
            />
          ))}
        </div>
      </dialog>
    </button>
  );
}

// ========== MAIN APP ==========
export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [hasClickedYes, setHasClickedYes] = useState(false);
  const [showYesDialog, setShowYesDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [noClickCount, setNoClickCount] = useState(0);
  const [noButtonPos, setNoButtonPos] = useState<{
    top: string;
    left: string;
  } | null>(null);

  const { startMusic } = useBgMusic();

  const currentYear = new Date().getFullYear();

  const handleSplashStart = useCallback(() => {
    startMusic();
    setSplashDone(true);
  }, [startMusic]);

  const handleYesClick = () => {
    setShowYesDialog(true);
  };

  const handleDialogDismiss = useCallback(() => {
    setShowYesDialog(false);
    setHasClickedYes(true);
    setShowConfetti(true);
  }, []);

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false);
  }, []);

  const handleNoClick = () => {
    const nextCount = noClickCount + 1;
    setNoClickCount(nextCount);

    const btnWidth = 200;
    const btnHeight = 50;
    const maxLeft = Math.max(60, window.innerWidth - btnWidth - 20);
    const maxTop = Math.max(60, window.innerHeight - btnHeight - 20);
    const newLeft = 20 + Math.random() * (maxLeft - 20);
    const newTop = 80 + Math.random() * (maxTop - 80);

    setNoButtonPos({
      top: `${newTop}px`,
      left: `${newLeft}px`,
    });
  };

  const noLabel =
    noClickCount === 0
      ? "No 🙅"
      : NO_PHRASES[(noClickCount - 1) % NO_PHRASES.length];

  const pageBg = {
    background:
      "linear-gradient(rgba(246, 240, 230, 0.55), rgba(239, 162, 170, 0.65)), url('/assets/generated/couple-hugging.dim_1920x1080.jpg') center/cover no-repeat fixed",
    minHeight: "100vh",
    position: "relative" as const,
    overflow: "hidden",
  };

  return (
    <div style={pageBg}>
      {/* Splash overlay — shown until first tap/click */}
      {!splashDone && <SplashScreen onStart={handleSplashStart} />}

      <FloatingHearts />

      {/* Yes dialog — shown after clicking Yes, before confetti */}
      {showYesDialog && <YesDialog onDismiss={handleDialogDismiss} />}

      {/* Confetti overlay */}
      {showConfetti && <HeartConfetti onComplete={handleConfettiComplete} />}

      {!hasClickedYes ? (
        // ===== MAIN SCREEN =====
        <main
          className="relative flex items-center justify-center min-h-screen px-4 py-12"
          style={{ zIndex: 10 }}
        >
          <div
            className="w-full max-w-xl rounded-3xl p-8 md:p-12 flex flex-col items-center gap-6 text-center"
            style={{
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow:
                "0 8px 40px rgba(140, 43, 82, 0.18), 0 2px 12px rgba(192, 68, 106, 0.12)",
              border: "1px solid rgba(181, 106, 122, 0.25)",
              position: "relative",
              zIndex: 10,
            }}
            data-ocid="birthday.card"
          >
            {/* Decorative top flourish */}
            <div
              aria-hidden="true"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: "1rem",
                color: "#B56A7A",
                letterSpacing: "0.1em",
                opacity: 0.8,
              }}
            >
              ✨ A Special Message ✨
            </div>

            {/* Main Heading */}
            <h1
              className="leading-snug"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                color: "#5A2E23",
                lineHeight: 1.4,
              }}
            >
              Happy Birthday in advance, Sakshi ! They say birthdays are for
              making wishes, but I&apos;m hoping you&apos;ll grant mine: Will
              you celebrate your special day with me this time?🎂💌🕊️?
            </h1>

            {/* CTA Buttons */}
            <div
              className="flex flex-col items-center gap-3 w-full"
              data-ocid="birthday.panel"
            >
              {/* YES Button */}
              <button
                type="button"
                onClick={handleYesClick}
                className="btn-yes w-full max-w-xs px-8 py-4 rounded-full text-white font-bold text-lg cursor-pointer"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  border: "none",
                  outline: "none",
                }}
                data-ocid="birthday.primary_button"
              >
                Yes, I will! 💖
              </button>

              {/* NO Button — either normal flow or fixed position */}
              {noButtonPos === null ? (
                <button
                  type="button"
                  onClick={handleNoClick}
                  className="btn-no px-6 py-3 rounded-full text-sm font-medium cursor-pointer"
                  style={{
                    background: "#FDF0F3",
                    border: "1.5px solid #B56A7A",
                    color: "#5A2E23",
                    fontFamily: "'Playfair Display', serif",
                    minWidth: "120px",
                    boxShadow: "0 2px 8px rgba(181, 106, 122, 0.15)",
                  }}
                  data-ocid="birthday.secondary_button"
                >
                  No 🙅
                </button>
              ) : null}
            </div>
          </div>
        </main>
      ) : (
        // ===== SUCCESS SCREEN =====
        <main
          className="relative flex items-center justify-center min-h-screen px-4 py-12"
          style={{ zIndex: 10 }}
        >
          <div
            className="success-enter w-full max-w-xl rounded-3xl p-8 md:p-12 flex flex-col items-center gap-6 text-center"
            style={{
              background: "rgba(255, 255, 255, 0.72)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:
                "0 8px 40px rgba(140, 43, 82, 0.22), 0 2px 12px rgba(192, 68, 106, 0.15)",
              border: "1px solid rgba(181, 106, 122, 0.3)",
              position: "relative",
              zIndex: 10,
            }}
            data-ocid="birthday.success_state"
          >
            {/* Special Photo */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ maxWidth: "280px", width: "100%" }}
            >
              <img
                src="/assets/images_5_1-019d5dff-4ed7-77e2-a6fa-64d2c72b94d0.jpeg"
                alt="A special moment for Sakshi"
                className="w-full rounded-2xl"
                style={{
                  boxShadow: "0 4px 20px rgba(140, 43, 82, 0.3)",
                  display: "block",
                }}
              />
            </div>

            {/* Success Messages */}
            <div className="flex flex-col items-center gap-4">
              <p
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "clamp(1.6rem, 4vw, 2rem)",
                  fontWeight: 700,
                  color: "#8C2B52",
                  lineHeight: 1.3,
                }}
              >
                I knew you&apos;d say yes! 💖
              </p>

              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                  color: "#5A2E23",
                  lineHeight: 1.4,
                }}
              >
                You&apos;ve made me the happiest! 🌟
              </p>

              <p
                className="max-w-sm"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
                  color: "#1F1B1D",
                  lineHeight: 1.6,
                }}
              >
                This Birthday is going to be magical with you by my side...!!
              </p>

              <p
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "clamp(1.3rem, 3.5vw, 1.6rem)",
                  fontWeight: 700,
                  color: "#A33A67",
                  lineHeight: 1.4,
                }}
              >
                Can&apos;t wait to celebrate with you, Sakshi !!! 🎂🌹
              </p>
            </div>

            {/* Floating hearts decoration */}
            <div
              aria-hidden="true"
              style={{
                fontSize: "28px",
                animation: "sparkle 3s ease-in-out infinite",
                lineHeight: 1,
              }}
            >
              💕
            </div>
          </div>
        </main>
      )}

      {/* Fixed No Button (after first click) */}
      {!hasClickedYes && noButtonPos !== null && (
        <button
          type="button"
          onClick={handleNoClick}
          style={{
            position: "fixed",
            top: noButtonPos.top,
            left: noButtonPos.left,
            transition: "top 0.5s ease, left 0.5s ease",
            zIndex: 1000,
            background: "#FDF0F3",
            border: "1.5px solid #B56A7A",
            color: "#5A2E23",
            fontFamily: "'Playfair Display', serif",
            padding: "10px 20px",
            borderRadius: "9999px",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            boxShadow: "0 2px 12px rgba(181, 106, 122, 0.2)",
            minWidth: "130px",
            whiteSpace: "nowrap",
          }}
          data-ocid="birthday.secondary_button"
          aria-label={`No button: ${noLabel}`}
        >
          {noLabel}
        </button>
      )}

      {/* Footer */}
      <footer
        className="relative text-center py-4 px-4"
        style={{
          zIndex: 10,
          fontFamily: "'Playfair Display', serif",
          fontSize: "0.75rem",
          color: "#B56A7A",
          opacity: 0.8,
        }}
      >
        © {currentYear}. Built with{" "}
        <span aria-hidden="true" style={{ color: "#C0446A" }}>
          ❤️
        </span>{" "}
        using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#8C2B52", textDecoration: "underline" }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
