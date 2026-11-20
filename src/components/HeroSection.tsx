import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
const logoSplash = "/images/logo-splash.png";

// Immagine hero in public/ per abilitare il preload in index.html
const heroBg = "/images/hero-poster-v2.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

// Sceglie il video in base al dispositivo. Restituisce null (resta l'immagine) se
// l'utente ha ridotto le animazioni, ha il risparmio dati o una connessione 2G.
const pickHeroVideo = (): string | null => {
  if (typeof window === "undefined") return null;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return null;
  if (conn?.saveData || /2g$/.test(conn?.effectiveType ?? "")) return null;
  return window.matchMedia?.("(min-width: 768px)").matches
    ? "/videos/hero-v2-720.mp4"
    : "/videos/hero-v2-480.mp4";
};

const HeroSection = ({ onIntroComplete }: { onIntroComplete?: () => void }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);

  const [videoSrc] = useState<string | null>(pickHeroVideo);
  const [showContent, setShowContent] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [introPhase, setIntroPhase] = useState<"logo" | "transition" | "done">("logo");

  const tryPlayVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    startedRef.current = true;
    video.currentTime = 0;
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    const p = video.play();
    if (p) {
      p.catch(() => {
        setTimeout(() => {
          video.play().catch(() => {});
        }, 300);
      });
    }
  }, []);

  // Logo intro → 2.5s → start video → show content
  useEffect(() => {
    const t1 = setTimeout(() => {
      setIntroPhase("transition");
      tryPlayVideo();
    }, 2500);

    const t2 = setTimeout(() => {
      setIntroPhase("done");
      onIntroComplete?.();
    }, 3000);

    const t3 = setTimeout(() => {
      setShowContent(true);
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [tryPlayVideo, onIntroComplete]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onCanPlay = () => setVideoLoaded(true);
    if (video.readyState >= 3) {
      setVideoLoaded(true);
    } else {
      video.addEventListener("canplay", onCanPlay, { once: true });
      return () => video.removeEventListener("canplay", onCanPlay);
    }
  }, []);

  // Ferma il video quando l'hero esce dallo schermo: meno decodifica, meno blocchi
  useEffect(() => {
    const section = ref.current;
    const video = videoRef.current;
    if (!section || !video || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) video.pause();
        else if (startedRef.current) video.play().catch(() => {});
      },
      { threshold: 0.05 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, [videoSrc]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.6]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section ref={ref} className="relative h-[100svh] flex flex-col overflow-hidden">
      {/* H1 della home: il testo visibile dell'hero è dentro il video, quindi serve per SEO e screen reader */}
      <h1 className="sr-only">{t("hero.seoHeading")}</h1>

      {/* Logo Intro Overlay */}
      <AnimatePresence>
        {introPhase !== "done" && (
          <motion.div
            className="absolute inset-0 z-50 bg-black flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            {/* Radial glow */}
            <motion.div
              className="absolute w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, hsl(0 72% 51% / 0.25) 0%, transparent 70%)",
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 1, ease }}
            />

            {/* Logo */}
            <motion.img
              src={logoSplash}
              alt="SetupEvents"
              className="relative z-10 w-[75vw] max-w-[600px] md:w-[45vw] md:max-w-[700px]"
              initial={{ opacity: 0, scale: 0.7, y: 30 }}
              animate={
                introPhase === "transition"
                  ? { opacity: 0, scale: 1.4, y: -20, filter: "blur(8px)" }
                  : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
              }
              transition={
                introPhase === "transition"
                  ? { duration: 0.6, ease }
                  : { duration: 0.8, ease }
              }
            />

            {/* Corner accents */}
            {[
              "top-6 left-6 origin-top-left",
              "top-6 right-6 origin-top-right",
              "bottom-6 left-6 origin-bottom-left",
              "bottom-6 right-6 origin-bottom-right",
            ].map((pos, i) => (
              <motion.div
                key={i}
                className={`absolute ${pos} z-20`}
                initial={{ opacity: 0, scale: 0 }}
                animate={
                  introPhase === "transition"
                    ? { opacity: 0, scale: 0 }
                    : { opacity: 0.3, scale: 1 }
                }
                transition={{ duration: 0.4, delay: introPhase === "transition" ? 0 : 0.6 + i * 0.08, ease }}
              >
                <div className="w-6 h-px bg-primary" />
                <div className="w-px h-6 bg-primary" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immagine di sfondo — sempre visibile come base */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Video background */}
      <motion.div className="absolute inset-0" style={{ scale: videoScale, willChange: "transform" }}>
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            loop
            muted
            playsInline
            webkit-playsinline=""
            preload="auto"
            poster={heroBg}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              minWidth: "100%",
              minHeight: "100%",
              opacity: videoLoaded ? 1 : 0,
              transition: "opacity 0.7s ease",
            }}
          />
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(var(--background) / 0.8) 100%)" }}
        />
        <div className="absolute inset-0 pointer-events-none bg-black/45" />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: overlayOpacity, background: "hsl(var(--background))" }}
        />
      </motion.div>

      {/* Top bar */}
      <motion.div
        className="relative z-10 flex justify-between items-center container-custom pt-20 md:pt-28"
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <span className="text-xs text-white/55 font-mono tracking-wider hidden sm:inline">
          {t("hero.agency")}
        </span>
      </motion.div>

      {/* CTA centrato verticalmente */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          style={{ y: contentY }}
          className="relative z-10 flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.9, ease }}
        >
          <Link
            to="/contatti"
            className="inline-flex items-center gap-2 bg-primary/90 hover:bg-primary text-primary-foreground px-7 py-3.5 md:px-9 md:py-4 rounded-full font-bold text-sm md:text-base tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_hsl(var(--primary)/0.35)]"
          >
            {t("hero.cta")}
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="relative z-10 container-custom pb-10 md:pb-16 flex justify-center"
        style={{ y: contentY }}
      >
        <motion.div
          className="flex items-center gap-3 cursor-pointer group"
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ delay: 1.6 }}
          onClick={() => document.getElementById("storia")?.scrollIntoView({ behavior: "smooth" })}
        >
          <div className="w-px h-7 bg-white/15 group-hover:bg-white/30 transition-colors duration-300" />
          <span className="text-white/55 text-xs uppercase tracking-[0.3em] font-medium group-hover:text-white/80 transition-colors duration-300">
            {t("hero.scroll")}
          </span>
        </motion.div>
      </motion.div>

      {/* Side dots */}
      <motion.div
        className="absolute right-6 md:right-10 lg:right-14 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-3.5 hidden md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ delay: 1.3 }}
      >
        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
