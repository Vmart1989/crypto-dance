"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";
import { guideContent } from "@/i18n/guide";

export default function GuidePage() {
  const { locale, href } = useLanguage();
  const { user } = useUser();
  const content = guideContent[locale] || guideContent.en;
  const practiceHref = href(user ? "/dashboard" : "/register");
  const homeHref = href("/");
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: content.metaTitle,
        description: content.metaDescription,
        url: `https://www.cryptodance.app${href("/guide")}`,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", name: "CryptoDance", url: "https://www.cryptodance.app" },
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };

  return (
    <main className="container guide-page pb-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <section className="guide-hero">
        <div className="eyebrow mb-3">{content.eyebrow}</div>
        <h1>{content.title}</h1>
        <p className="guide-lead">{content.intro}</p>
        <div className="d-flex flex-wrap gap-2 mt-4">
          <Link href={practiceHref} className="btn btn-primary px-4">{content.startButton}</Link>
          <Link href={`${homeHref}#market`} className="btn btn-outline-primary px-4">{content.marketButton}</Link>
        </div>
      </section>

      <nav className="guide-jump-nav" aria-label={content.jumpLabel}>
        <span>{content.jumpLabel}</span>
        <a href="#getting-started">{content.jumpStart}</a>
        <a href="#practice-method">{content.jumpPractice}</a>
        <a href="#before-real-assets">{content.jumpReady}</a>
        <a href="#guide-faq">{content.jumpFaq}</a>
      </nav>

      <section id="getting-started" className="guide-section" aria-labelledby="getting-started-title">
        <div className="guide-section-heading">
          <div className="eyebrow mb-3">{content.startEyebrow}</div>
          <h2 id="getting-started-title">{content.startTitle}</h2>
          <p>{content.startIntro}</p>
        </div>
        <ol className="guide-steps">
          {content.steps.map((step) => (
            <li key={step.title}>
              <div><h3>{step.title}</h3><p>{step.body}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section id="practice-method" className="guide-section" aria-labelledby="practice-title">
        <div className="guide-section-heading">
          <div className="eyebrow mb-3">{content.practiceEyebrow}</div>
          <h2 id="practice-title">{content.practiceTitle}</h2>
          <p>{content.practiceIntro}</p>
        </div>
        <div className="guide-method-grid">
          {content.methods.map((method) => (
            <article className="premium-panel guide-method-card" key={method.title}>
              <i className={`bi ${method.icon}`} aria-hidden="true" />
              <h3>{method.title}</h3>
              <p>{method.body}</p>
            </article>
          ))}
        </div>
        <aside className="guide-reality-note">
          <i className="bi bi-exclamation-diamond" aria-hidden="true" />
          <div><h3>{content.realityNoteTitle}</h3><p>{content.realityNote}</p></div>
        </aside>
      </section>

      <section id="before-real-assets" className="guide-section guide-ready" aria-labelledby="ready-title">
        <div className="guide-section-heading">
          <div className="eyebrow mb-3">{content.readyEyebrow}</div>
          <h2 id="ready-title">{content.readyTitle}</h2>
          <p>{content.readyIntro}</p>
        </div>
        <ul className="guide-checklist">
          {content.checklist.map((item) => <li key={item}><i className="bi bi-check2" aria-hidden="true" /><span>{item}</span></li>)}
        </ul>
      </section>

      <section id="guide-faq" className="guide-section" aria-labelledby="guide-faq-title">
        <div className="guide-section-heading">
          <div className="eyebrow mb-3">{content.faqEyebrow}</div>
          <h2 id="guide-faq-title">{content.faqTitle}</h2>
        </div>
        <div className="faq-list guide-faq-list">
          {content.faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
        </div>
      </section>

      <p className="guide-disclaimer"><i className="bi bi-shield-exclamation" aria-hidden="true" /> {content.disclaimer}</p>

      <section className="premium-panel guide-cta">
        <div><h2>{content.ctaTitle}</h2><p>{content.ctaBody}</p></div>
        <Link href={practiceHref} className="btn btn-primary px-4">{content.ctaButton}</Link>
      </section>
    </main>
  );
}
