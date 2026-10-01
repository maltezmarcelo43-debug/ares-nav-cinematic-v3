"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";

import { copy, type Locale } from "@/lib/i18n";

type CinematicLoaderProps = {
  locale: Locale;
};

export default function CinematicLoader({ locale }: CinematicLoaderProps) {
  const { active, loaded, total, progress, errors } = useProgress();
  const [visible, setVisible] = useState(true);
  const loadingStarted = useRef(false);
  const labels = copy[locale].loader;

  useEffect(() => {
    if (active || total > 0) loadingStarted.current = true;
    if (!loadingStarted.current || active || total === 0 || loaded < total) return;

    const timeout = window.setTimeout(() => setVisible(false), 450);
    return () => window.clearTimeout(timeout);
  }, [active, loaded, total]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 6500);
    return () => window.clearTimeout(timeout);
  }, []);

  const percentage = total > 0 ? Math.max(4, Math.round(progress)) : 4;
  const label =
    errors.length > 0
      ? labels.fallback
      : active
        ? labels.syncing
        : labels.initializing;

  return (
    <div
      className={`asset-loader ${visible ? "" : "is-ready"}`}
      role="status"
      aria-live="polite"
    >
      <div className="asset-loader-inner">
        <div className="asset-loader-brand">
          ARES <span>NAV</span>
        </div>
        <div className="asset-loader-value">
          {percentage.toString().padStart(2, "0")}%
        </div>
        <div className="asset-loader-track">
          <span style={{ transform: `scaleX(${percentage / 100})` }} />
        </div>
        <div className="asset-loader-label">{label}</div>
      </div>
    </div>
  );
}
