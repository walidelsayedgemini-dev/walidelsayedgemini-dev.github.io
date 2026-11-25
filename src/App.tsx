import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import { I18nProvider, useI18n } from "./i18n";
import { Boot, Cursor, ScrollProgress } from "./components/Chrome";
import { Hero, Nav } from "./components/Hero";
import { Stats } from "./components/Stats";
import { Work } from "./components/Work";
import { Stack, Timeline } from "./components/Sections";
import { About, Contact } from "./components/AboutContact";
import { Journey } from "./components/Journey";
import { Palette } from "./components/Palette";
import { SideDots, useFx } from "./components/Extras";
import { usePrefersReduced } from "./lib/util";

function Shell() {
  const { t } = useI18n();
  const reduced = usePrefersReduced();
  const [booted, setBooted] = useState(() => reduced || sessionStorage.getItem("booted") === "1");
  useFx();
  const [palette, setPalette] = useState(false);
  const [toast, setToast] = useState(false);

  const onBootDone = useCallback(() => {
    sessionStorage.setItem("booted", "1");
    setBooted(true);
  }, []);
  const flash = useCallback(() => {
    setToast(true);
    setTimeout(() => setToast(false), 1800);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    (window as unknown as { __lenis: Lenis }).__lenis = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      } else if (e.key === "/" && !(e.target as HTMLElement)?.closest?.("input,textarea")) {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="grain" aria-hidden />
      <Cursor />
      <ScrollProgress />
      {!booted && <Boot onDone={onBootDone} />}
      {booted && <SideDots />}
      <Nav openPalette={() => setPalette(true)} />
      <main>
        <Hero ready={booted} />
        <Stats />
        <Work />
        <Stack />
        <Timeline />
        <About />
        <Journey />
        <Contact onCopied={flash} />
      </main>
      <AnimatePresence>{palette && <Palette onClose={() => setPalette(false)} onCopied={flash} />}</AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div className="toast" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
            {t("contact.copied")}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  );
}
