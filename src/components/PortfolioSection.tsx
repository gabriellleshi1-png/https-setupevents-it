import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FloatingElements from "./FloatingElements";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useInstagramFeed } from "@/hooks/useInstagramFeed";

// Use string paths for lazy loading — images load on scroll, not on page load

const dieselCard = new URL("@/assets/diesel-card.jpg", import.meta.url).href;
const mediolanumCard = new URL("@/assets/mediolanum-card.webp", import.meta.url).href;
const distretto12Card = new URL("@/assets/distretto12-card.webp", import.meta.url).href;
const coldirettiCard = new URL("@/assets/coldiretti-card.webp", import.meta.url).href;
const diesel9 = new URL("@/assets/diesel-9.webp", import.meta.url).href;
const dieselEvent1 = new URL("@/assets/diesel-event-1.jpg", import.meta.url).href;
const dieselEvent4 = new URL("@/assets/diesel-event-4.jpg", import.meta.url).href;
const dieselEvent5 = new URL("@/assets/diesel-event-5.jpg", import.meta.url).href;
const dieselEvent6 = new URL("@/assets/diesel-event-6.jpg", import.meta.url).href;
const dieselEvent7 = new URL("@/assets/diesel-event-7.jpg", import.meta.url).href;
const dieselEvent8 = new URL("@/assets/diesel-event-8.jpg", import.meta.url).href;
const dieselEvent9 = new URL("@/assets/diesel-event-9.webp", import.meta.url).href;
const dieselEvent10 = new URL("@/assets/diesel-event-10.webp", import.meta.url).href;
const dieselEvent11 = new URL("@/assets/diesel-event-11.webp", import.meta.url).href;
const dieselEvent12 = new URL("@/assets/diesel-event-12.webp", import.meta.url).href;
const dieselEvent13 = new URL("@/assets/diesel-event-13.webp", import.meta.url).href;
const dieselEvent14 = new URL("@/assets/diesel-event-14.webp", import.meta.url).href;
const dieselEvent15 = new URL("@/assets/diesel-event-15.webp", import.meta.url).href;
const mediolanum1 = new URL("@/assets/mediolanum-1.webp", import.meta.url).href;
const mediolanum2 = new URL("@/assets/mediolanum-2.webp", import.meta.url).href;
const mediolanum3 = new URL("@/assets/mediolanum-3.webp", import.meta.url).href;
const mediolanum4 = new URL("@/assets/mediolanum-4.webp", import.meta.url).href;
const diesel1 = new URL("@/assets/diesel-1.webp", import.meta.url).href;
const dieselEvent13img = new URL("@/assets/diesel-event-13.webp", import.meta.url).href;
const distretto12_1 = new URL("@/assets/distretto12-1.jpg", import.meta.url).href;
const distretto12_2 = new URL("@/assets/distretto12-2.jpg", import.meta.url).href;
const distretto12_3 = new URL("@/assets/distretto12-3.webp", import.meta.url).href;
const distretto12_4 = new URL("@/assets/distretto12-4.webp", import.meta.url).href;
const coldiretti1 = new URL("@/assets/coldiretti-1.webp", import.meta.url).href;
const coldiretti2 = new URL("@/assets/coldiretti-2.webp", import.meta.url).href;
const coldiretti3 = new URL("@/assets/coldiretti-3.webp", import.meta.url).href;
const coldiretti4 = new URL("@/assets/coldiretti-4.webp", import.meta.url).href;

const ease = [0.22, 1, 0.36, 1] as const;

const caseStudiesData = [
  { image: dieselCard,      title: "Diesel",      year: "2024", href: "/case-study/diesel" },
  { image: mediolanumCard,  title: "Mediolanum",  year: "2025", href: "/case-study/mediolanum" },
  { image: distretto12Card, title: "Distretto 12", year: "2026", href: "/case-study/distretto-12" },
  { image: coldirettiCard,  title: "Coldiretti",  year: "2026", href: "/case-study/coldiretti" },
];

// Immagini di riserva: usate solo se il feed Instagram non è disponibile.
const fallbackGalleryImages = [
  // Diesel
  diesel9, diesel1, dieselEvent13img, dieselEvent9,
  // Mediolanum
  mediolanum1, mediolanum2, mediolanum3, mediolanum4,
  // Distretto 12
  distretto12_1, distretto12_2, distretto12_3, distretto12_4,
  // Coldiretti
  coldiretti1, coldiretti2, coldiretti3, coldiretti4,
];

interface GalleryItem {
  src: string;
  alt: string;
  href?: string;
}

const fallbackGallery: GalleryItem[] = fallbackGalleryImages.map((src, i) => ({ src, alt: `Event photo ${i + 1}` }));

// Tiene la galleria piena anche con pochi post: ripete gli elementi fino ad almeno `min`.
const fillTo = <T,>(items: T[], min: number): T[] =>
  items.length === 0 || items.length >= min ? items : Array.from({ length: min }, (_, i) => items[i % items.length]);

const FlipCard = ({ index }: { index: number }) => {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);
  const study = caseStudiesData[index];
  const subtitle = t(`portfolio.cases.${index}.subtitle`);
  const category = t(`portfolio.cases.${index}.category`);
  const description = t(`portfolio.cases.${index}.description`);

  return (
    <motion.div className="relative w-full cursor-pointer" style={{ perspective: 1200 }} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.15, ease }} onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)}>
      <Link to={study.href} aria-label={`${study.title} — ${category}`} className="block">
        <motion.div className="relative w-full aspect-[4/5] md:aspect-[3/4]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }} style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
            <img src={study.image} alt={`${study.title} - ${category}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-5 left-6"><span className="text-xs font-mono text-white/60">[{String(index + 1).padStart(2, "0")}]</span></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span className="text-xs font-medium text-primary uppercase tracking-[0.2em] block mb-2">{category}</span>
              <h3 className="text-2xl md:text-4xl xl:text-3xl font-display font-extrabold text-white tracking-tight">{study.title}</h3>
              <span className="text-xs text-white/60 font-mono mt-1 block">{study.year}</span>
            </div>
          </div>
          <div className="absolute inset-0 rounded-2xl overflow-hidden bg-black/75 md:bg-black/30 backdrop-blur-md border border-white/[0.06] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-center p-8 md:p-12 xl:p-7" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <span className="text-xs font-medium text-primary uppercase tracking-[0.2em] block mb-3">{category} — {study.year}</span>
            <h3 className="text-2xl md:text-4xl xl:text-3xl font-display font-extrabold text-white tracking-tight mb-2">{study.title}</h3>
            <p className="text-sm text-primary font-medium mb-6 xl:mb-4">{subtitle}</p>
            <p className="text-[13px] md:text-base xl:text-[13px] text-white/85 leading-relaxed">{description}</p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

const ScrollGallery = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef(1);
  const { data: posts } = useInstagramFeed();

  // Ogni post Instagram popola la gallery; se il feed non è disponibile si usano le immagini di riserva.
  const galleryItems: GalleryItem[] =
    posts && posts.length > 0
      ? posts.map((p) => ({
          src: p.image,
          alt: p.caption ? `Instagram — ${p.caption}` : "Post Instagram SetupEvents",
          href: p.permalink,
        }))
      : fallbackGallery;
  const baseItems = fillTo(galleryItems, 12);
  const doubledImages = [...baseItems, ...baseItems];

  // Scorrimento automatico: gira solo mentre la galleria è visibile, misura la larghezza
  // una volta sola (non a ogni frame) e ha velocità indipendente dal refresh dello schermo.
  useEffect(() => {
    const el = trackRef.current;
    const wrap = el?.parentElement;
    if (!el || !wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pxPerSecond = 48;
    let position = 0;
    let half = el.scrollWidth / 2;
    let raf = 0;
    let running = false;
    let last = 0;

    const step = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      position += (pxPerSecond * speedRef.current * dt) / 1000;
      if (position >= half) position -= half;
      if (position < 0) position += half;
      el.style.transform = `translate3d(-${position}px, 0, 0)`;
      raf = requestAnimationFrame(step);
    };
    const start = () => {
      if (running || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(wrap);
    const ro = new ResizeObserver(() => {
      half = el.scrollWidth / 2;
    });
    ro.observe(el);
    const onVisibility = () => (document.hidden ? stop() : undefined);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [doubledImages.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    if (x < 0.3) speedRef.current = -0.5 + x * 2;
    else if (x > 0.7) speedRef.current = 1 + (x - 0.7) * 10;
    else speedRef.current = 1;
  }, []);

  const handleMouseLeave = useCallback(() => { speedRef.current = 1; }, []);

  return (
    <div className="relative overflow-hidden" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/60 to-transparent z-[1] pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black/60 to-transparent z-[1] pointer-events-none" />
      <div ref={trackRef} className="flex gap-4 md:gap-5 will-change-transform">
        {doubledImages.map((item, i) => {
          const content = (
            <>
              <img src={item.src} alt={item.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 border-2 border-white/0 group-hover/card:border-white/20 rounded-xl transition-all duration-500" />
            </>
          );
          const cls = "flex-shrink-0 w-[60vw] md:w-[280px] lg:w-[320px] aspect-[3/4] rounded-xl overflow-hidden cursor-pointer relative group/card block";
          return (
            <motion.div key={i} className={cls} whileHover={{ scale: 1.06, zIndex: 10 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="block w-full h-full" aria-label={item.alt} draggable={false}>
                  {content}
                </a>
              ) : (
                content
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const PortfolioSection = () => {
  const { t } = useTranslation();

  return (
    <section id="portfolio" className="relative overflow-hidden">
      <div className="relative z-10 py-12 sm:py-14 md:py-24">
        <FloatingElements variant="dots" count={8} />
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <motion.div className="flex items-center gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease }}>
              <span className="text-xs font-mono text-foreground/60">[03]</span>
              <span className="text-xs uppercase tracking-[0.3em] text-foreground/70 font-medium">{t("portfolio.label")}</span>
            </motion.div>
          </div>

          <motion.h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-7xl font-display font-extrabold tracking-tighter leading-[0.9] text-foreground mb-8 sm:mb-12 md:mb-20" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
            {t("portfolio.heading")}
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 md:gap-8" style={{ perspective: '800px' }}>
            {caseStudiesData.map((_, i) => (
              <div key={i} className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" style={{ transform: 'rotateX(2deg)' }}>
                <FlipCard index={i} />
              </div>
            ))}
          </div>
        </div>

        <motion.div className="mt-12 sm:mt-16 md:mt-28" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
          <div className="container-custom mb-6 md:mb-10">
            <h3 className="text-xl md:text-2xl font-display font-bold text-foreground tracking-tight">{t("portfolio.gallery")}</h3>
          </div>
          <ScrollGallery />
        </motion.div>
      </div>
    </section>
  );
};

export default PortfolioSection;
