import { business, gradient, gradientFlat } from "./config";

export default function Home() {
  return (
    <div style={styles.page}>
      <header style={styles.nav}>
        <span style={styles.logo}>{business.emoji} {business.name}</span>
        <a href="/book" style={{ ...styles.navBtn, background: gradientFlat }}>Book a Walk</a>
      </header>

      <section style={{ ...styles.hero, background: gradient }}>
        <p style={styles.heroEmoji}>{business.heroEmoji}</p>
        <h1 style={styles.heroTitle}>{business.tagline}</h1>
        <p style={styles.heroSubtitle}>{business.heroSubtitle}</p>
        <a href="/book" style={{ ...styles.ctaBtn, color: business.colors.secondary }}>Book a Walk 🐾</a>
      </section>

      <section style={styles.services}>
        <h2 style={styles.sectionTitle}>What we offer</h2>
        <div style={styles.cardGrid}>
          {business.services.map((s) => (
            <div key={s.title} style={styles.card}>
              <div style={styles.cardIcon}>{s.icon}</div>
              <h3 style={styles.cardTitle}>{s.title}</h3>
              <p style={styles.cardDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.howItWorks}>
        <h2 style={styles.sectionTitle}>How it works</h2>
        <div style={styles.steps}>
          {business.howItWorks.map((step, i) => (
            <div key={step} style={styles.step}>
              <div style={{ ...styles.stepNum, background: gradientFlat }}>{i + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
        <a href="/book" style={{ ...styles.ctaBtnAlt, background: gradientFlat }}>Book a Walk 🐾</a>
      </section>

      <footer style={styles.footer}>
        <p>{business.emoji} {business.name} — {business.footerNote}</p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#1a1a2e",
    background: "#fafaff",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logo: {
    fontWeight: 700,
    fontSize: 20,
  },
  navBtn: {
    color: "#fff",
    textDecoration: "none",
    padding: "10px 18px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
  },
  hero: {
    textAlign: "center",
    padding: "64px 20px 56px",
    color: "#fff",
  },
  heroEmoji: {
    fontSize: 40,
    margin: 0,
  },
  heroTitle: {
    fontSize: "clamp(28px, 5vw, 44px)",
    fontWeight: 800,
    margin: "12px 0 8px",
  },
  heroSubtitle: {
    fontSize: 17,
    maxWidth: 520,
    margin: "0 auto 28px",
    opacity: 0.95,
    lineHeight: 1.5,
  },
  ctaBtn: {
    display: "inline-block",
    background: "#fff",
    textDecoration: "none",
    padding: "14px 32px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 16,
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
  services: {
    padding: "56px 20px",
    maxWidth: 960,
    margin: "0 auto",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 32,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: "28px 22px",
    textAlign: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 8px",
  },
  cardDesc: {
    fontSize: 14,
    color: "#555",
    lineHeight: 1.5,
    margin: 0,
  },
  howItWorks: {
    textAlign: "center",
    padding: "56px 20px",
    background: "#f0f0fb",
  },
  steps: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 32,
    maxWidth: 720,
    margin: "0 auto 32px",
  },
  step: {
    maxWidth: 200,
  },
  stepNum: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    margin: "0 auto 10px",
  },
  ctaBtnAlt: {
    display: "inline-block",
    color: "#fff",
    textDecoration: "none",
    padding: "14px 32px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 16,
  },
  footer: {
    textAlign: "center",
    padding: "24px",
    fontSize: 13,
    color: "#888",
  },
};
