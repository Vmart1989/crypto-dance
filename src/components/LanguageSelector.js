"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { localeNames, localizePath } from "@/i18n/config";
import { useLanguage } from "@/context/LanguageContext";

const languageOrder = ["en", "es", "de", "fr"];
const shortNames = { en: "EN", es: "ES", de: "DE", fr: "FRA" };

export default function LanguageSelector() {
  const { locale, t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const changeLanguage = (nextLocale) => {
    setOpen(false);
    window.location.assign(localizePath(pathname, nextLocale));
  };

  return (
    <div className="language-picker" ref={pickerRef}>
      <button
        type="button"
        className="language-trigger"
        aria-label={t("language.label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{shortNames[locale]}</span>
        <i className="bi bi-chevron-down" aria-hidden="true" />
      </button>
      {open && (
        <div className="language-menu" role="listbox" aria-label={t("language.label")}>
          {languageOrder.map((code) => (
            <button
              type="button"
              role="option"
              aria-selected={locale === code}
              className={`language-option${locale === code ? " active" : ""}`}
              key={code}
              onClick={() => changeLanguage(code)}
            >
              <span>{localeNames[code]}</span>
              <small>{shortNames[code]}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
