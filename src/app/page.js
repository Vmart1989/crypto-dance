"use client";

import TopGainers from "@/components/TopGainers";
import LoginForm from "../components/LoginForm";
import TopCryptos from "../components/TopCryptos";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();
  const { locale, t, href } = useLanguage();
  const router = useRouter();
  const faqs = [1, 2, 3].map((number) => ({ question: t(`home.faq${number}Q`), answer: t(`home.faq${number}A`) }));
  const structuredData = [
    {
      "@context": "https://schema.org", "@type": "WebApplication", name: "CryptoDance",
      url: `https://www.cryptodance.app${href("/") === "/" ? "" : href("/")}`,
      description: t("meta.description"), applicationCategory: "EducationalApplication",
      operatingSystem: "Web", inLanguage: locale, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: faqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
    },
  ];

  return (
    <main className="container pb-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="row align-items-center py-4 py-lg-5 mb-4 g-5">
        <div className="col-lg-7 py-lg-4">
          <div className="eyebrow mb-3">{t("home.eyebrow")}</div>
          <h1 className="mb-4">{t("home.titleLine1")}<br /><span className="text-gradient">{t("home.titleLine2")}</span></h1>
          <p className="hero-copy mb-4">{t("home.intro")}</p>
          <div className="d-flex flex-wrap gap-2">
            <Link href={href(user ? "/dashboard" : "/register")} className="btn btn-primary px-4">{user ? t("home.dashboard") : t("home.start")}</Link>
            <a href="#market" className="btn btn-outline-primary px-4">{t("home.explore")}</a>
          </div>
          <div className="hero-proof">
            <span><i className="bi bi-check2-circle" /> {t("home.proofLive")}</span>
            <span><i className="bi bi-check2-circle" /> {t("home.proofFunds")}</span>
            <span><i className="bi bi-check2-circle" /> {t("home.proofRisk")}</span>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="premium-panel login-panel">
            {user ? <>
              <div className="eyebrow mb-3">{t("home.account")}</div>
              <h3>{t("home.welcome", { name: user.name || user.email })}</h3>
              <p className="panel-kicker">{t("home.portfolioReady")}</p>
              <button className="btn btn-primary w-100" onClick={() => router.push(href("/dashboard"))}>{t("home.dashboard")}</button>
            </> : <>
              <div className="eyebrow mb-3">{t("home.memberAccess")}</div>
              <h3>{t("home.continue")}</h3>
              <p className="panel-kicker">{t("home.signInCopy")}</p>
              <LoginForm />
              <p className="panel-kicker mt-4 mb-0 text-center">{t("home.newHere")} <Link href={href("/register")}>{t("home.createAccount")}</Link></p>
            </>}
          </div>
          <div className="premium-panel gainers-panel">
            <div className="d-flex align-items-start justify-content-between mb-3">
              <div><h3 className="mb-1">{t("home.movers")}</h3><p className="panel-kicker mb-0">{t("home.top100")}</p></div>
              <span className="status-label">{t("home.marketWatch")}</span>
            </div>
            <TopGainers />
          </div>
        </div>
      </section>

      <section id="market" className="market-panel">
        <div className="panel-heading"><div><div className="eyebrow mb-2">{t("home.marketOverview")}</div><h2>{t("home.topAssets")}</h2><p>{t("home.ranked")}</p></div><span className="status-label">{t("home.marketWatch")}</span></div>
        <TopCryptos />
      </section>

      <section className="seo-section" aria-labelledby="learn-title">
        <div className="section-intro"><div className="eyebrow mb-3">{t("home.learnEyebrow")}</div><h2 id="learn-title">{t("home.learnTitle")}</h2><p>{t("home.learnCopy")}</p></div>
        <div className="feature-grid">
          {[1, 2, 3].map((n) => <article className="premium-panel feature-card" key={n}><span className="feature-number">0{n}</span><h3>{t(`home.feature${n}Title`)}</h3><p>{t(`home.feature${n}Copy`)}</p></article>)}
        </div>
      </section>

      <section className="seo-section steps-section" aria-labelledby="how-title">
        <div className="section-intro"><div className="eyebrow mb-3">{t("home.howEyebrow")}</div><h2 id="how-title">{t("home.howTitle")}</h2></div>
        <ol className="steps-list">{[1, 2, 3].map((n) => <li key={n}><span>{n}</span><div><h3>{t(`home.step${n}Title`)}</h3><p>{t(`home.step${n}Copy`)}</p></div></li>)}</ol>
      </section>

      <section className="seo-section faq-section" aria-labelledby="faq-title">
        <div className="section-intro"><div className="eyebrow mb-3">{t("home.faqEyebrow")}</div><h2 id="faq-title">{t("home.faqTitle")}</h2></div>
        <div className="faq-list">{faqs.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        <p className="site-disclaimer"><i className="bi bi-info-circle" /> {t("home.disclaimer")}</p>
      </section>
    </main>
  );
}
