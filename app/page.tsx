"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import CinematicLoader from "@/components/ui/CinematicLoader";
import MissionConsole, {
  ConsoleButton,
  openMissionConsole,
} from "@/components/ui/MissionConsole";
import { cinematicState } from "@/lib/cinematic";
import { copy, type Locale } from "@/lib/i18n";

const SceneCanvas = dynamic(
  () => import("@/components/scene/SceneCanvas").then((module) => module.SceneCanvas),
  { ssr: false },
);

function ScrollRig() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      duration: reducedMotion ? 0 : 1.05,
      smoothWheel: !reducedMotion,
      syncTouch: false,
      wheelMultiplier: 0.9,
    });

    lenis.on("scroll", ({ velocity }) => {
      cinematicState.velocity = velocity;
      ScrollTrigger.update();
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const trigger = ScrollTrigger.create({
      trigger: "#cinematic-scroll",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: ({ progress }) => {
        cinematicState.progress = progress;
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
      cinematicState.progress = 0;
      cinematicState.velocity = 0;
    };
  }, []);

  return null;
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const text = copy[locale];

  useEffect(() => {
    const stored = window.localStorage.getItem("ares-locale");
    const preferred: Locale =
      stored === "es" || stored === "en"
        ? stored
        : navigator.language.toLowerCase().startsWith("es")
          ? "es"
          : "en";

    const timeout = window.setTimeout(() => setLocale(preferred), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem("ares-locale", locale);
  }, [locale]);

  return (
    <main>
      <ScrollRig />
      <CinematicLoader locale={locale} />
      <SceneCanvas />
      <div className="vignette" />
      <div className="noise" />

      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#earth" aria-label="ARES NAV">
          ARES <span>NAV</span>
        </a>
        <div className="nav-right">
          <div className="status">
            <span className="status-dot" /> {text.status}
          </div>
          <div className="language-toggle" role="group" aria-label={text.languageLabel}>
            {(["es", "en"] as Locale[]).map((option) => (
              <button
                key={option}
                type="button"
                className={locale === option ? "is-active" : ""}
                onClick={() => setLocale(option)}
                aria-pressed={locale === option}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
          <ConsoleButton>{text.openConsole}</ConsoleButton>
        </div>
      </nav>

      <div id="cinematic-scroll" className="scroll-shell">
        {text.scenes.map((scene, index) => (
          <section className={`scene scene-${scene.id}`} id={scene.id} key={scene.id}>
            <div className="scene-copy">
              <div className="eyebrow">{scene.eyebrow}</div>
              <h1>
                {scene.title.split("\n").map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <p>{scene.text}</p>
              <div className="meta-row">
                {scene.meta.map((item) => (
                  <span className="meta-chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              {index === text.scenes.length - 1 && (
                <button className="primary-cta" type="button" onClick={openMissionConsole}>
                  {text.enterConsole} <span>↗</span>
                </button>
              )}
            </div>
            <div className="scene-index">0{index + 1}</div>
          </section>
        ))}

        <section className="scene scene-console" id="mission-console">
          <div className="console-card">
            <div>
              <div className="eyebrow">{text.consoleSection}</div>
              <h2>
                {text.consoleTitle[0]}
                <br />
                {text.consoleTitle[1]}
              </h2>
              <p>{text.consoleDescription}</p>
              <ConsoleButton>{text.launchConsole} ↗</ConsoleButton>
            </div>
            <div className="console-preview" role="presentation">
              <iframe title="Mission console preview" src="/dashboard.html" tabIndex={-1} />
            </div>
          </div>
        </section>
      </div>

      <footer className="footer">
        <strong>ARES NAV · CINEMATIC V3</strong>
        <span>{text.footer}</span>
      </footer>

      <MissionConsole locale={locale} />
    </main>
  );
}
