"use client";

import { useEffect, useState, type ReactNode } from "react";

import { copy, type Locale } from "@/lib/i18n";

type MissionConsoleProps = {
  locale: Locale;
};

type ConsoleButtonProps = {
  children?: ReactNode;
};

export function openMissionConsole() {
  window.dispatchEvent(new Event("ares:open-console"));
}

export function ConsoleButton({ children = "OPEN CONSOLE" }: ConsoleButtonProps) {
  return (
    <button className="nav-btn" type="button" onClick={openMissionConsole}>
      {children}
    </button>
  );
}

export default function MissionConsole({ locale }: MissionConsoleProps) {
  const [open, setOpen] = useState(false);
  const text = copy[locale];

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    document.documentElement.style.overflow = open ? "hidden" : "";

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const showConsole = () => setOpen(true);
    window.addEventListener("ares:open-console", showConsole);
    return () => window.removeEventListener("ares:open-console", showConsole);
  }, []);

  return (
    <div className={`console-modal ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="console-topbar">
        <div>
          <span className="kicker">{text.consoleKicker}</span>
          <strong>{text.consoleSubtitle}</strong>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={text.closeConsoleLabel}
        >
          {text.closeConsole} ×
        </button>
      </div>
      <iframe title="ARES Mission Console" src="/dashboard.html" loading="lazy" />
    </div>
  );
}
