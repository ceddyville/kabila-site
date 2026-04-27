import Link from "next/link";
import Nav from "@/components/nav";
import Divider from "@/components/divider";
import StatsRow from "@/components/stat-card";
import HeroCard from "@/components/hero-card";
import Footer from "@/components/footer";
import { LANDING_STATS, FEATURES } from "@/lib/sample-data";
import styles from "./page.module.css";

function PeopleIcon({ size = 22, color = "#b83225" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <circle cx="9" cy="7" r="3" /><circle cx="17" cy="9" r="2.5" />
      <path d="M2 20c0-3.5 2.8-6 7-6s7 2.5 7 6" /><path d="M17 14c2.8 0 5 1.5 5 4" />
    </svg>
  );
}

function LangIcon({ size = 22, color = "#c4720e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 8l7 8 7-8" /><path d="M4 4h16" /><path d="M12 4v4" />
      <path d="M8 20h8" /><path d="M12 16v4" />
    </svg>
  );
}

function MapIcon({ size = 22, color = "#0d8c7e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
      <path d="M9 3v15" /><path d="M15 6v15" />
    </svg>
  );
}

function PenIcon({ size = 22, color = "#0d8c7e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

const ICONS = [
  <PeopleIcon key="people" />,
  <LangIcon key="lang" />,
  <MapIcon key="map" />,
  <PenIcon key="pen" />,
];

export default function LandingPage() {
  return (
    <>
      <Nav />

      {/* Hero */}
      <section className={`${styles.hero} fade-up`}>
        <div>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            African Peoples &amp; Lineages
            <span className={styles.eyebrowLine} />
          </div>
          <h1 className={styles.heading}>
            Every clan has a <em>story.</em>
            <br />
            Every people, a <em>homeland.</em>
          </h1>
          <p className={styles.slogan}>
            A census counts people.
            <br />
            Kabila tells you <em>who they are</em>.
          </p>
          <p className={styles.sub}>
            Ethnic groups, clans, lineage systems, and language families —
            structured, open, and built for{" "}
            <strong>
              researchers, educators, and diaspora communities
            </strong>
            .
          </p>
          <div className={styles.actions}>
            <Link href="/ethnic-groups" className={styles.btnPrimary}>
              Explore Groups
            </Link>
            <Link href="/docs" className={styles.btnGhost}>
              API Docs
            </Link>
          </div>
        </div>
        <div>
          <HeroCard />
        </div>
      </section>

      <Divider />

      <div className="fade-up delay-2">
        <StatsRow stats={LANDING_STATS} />
      </div>

      <Divider />

      {/* Features */}
      <div className={`${styles.features} fade-up delay-3`}>
        <div className={styles.featGrid}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={styles.feat}>
              <div
                className={styles.featIcon}
                style={{ background: f.iconBg }}
              >
                {ICONS[i]}
              </div>
              <h3 className={styles.featTitle}>{f.title}</h3>
              <p className={styles.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Community CTA */}
      <div className={`${styles.gdpr} fade-up delay-3`}>
        <div className={styles.gdprInner}>
          <div>
            <div className={styles.gdprLabel} style={{ color: "var(--ocean-lt)" }}>Community</div>
            <div className={styles.gdprHeading}>
              Your people belong <em>here</em>
            </div>
            <div className={styles.gdprBody}>
              If your clan, ethnic group, or lineage system isn&rsquo;t
              represented &mdash; or if existing data is incomplete &mdash; you
              can fix that. Every contribution is reviewed, attributed, and
              preserved.
            </div>
          </div>
          <Link href="/contribute" className={styles.btnGold}>
            Add Data &rarr;
          </Link>
        </div>
      </div>

      <Divider />

      {/* Open Data CTA */}
      <div className={`${styles.gdpr} fade-up delay-3`}>
        <div className={styles.gdprInner}>
          <div>
            <div className={styles.gdprLabel}>Open Data</div>
            <div className={styles.gdprHeading}>
              African ethnographic data, structured and{" "}
              <em>freely accessible.</em>
            </div>
            <div className={styles.gdprBody}>
              Kabila&rsquo;s API is free for researchers, educators, and
              developers. Every record is source-cited and
              community-verifiable. Built on Django REST Framework with full
              Swagger documentation.
            </div>
            <span className={styles.gdprTag}>
              REST API &middot; Open Access &middot; Source-Cited
            </span>
          </div>
          <Link href="/docs" className={styles.btnGold}>
            View API Docs
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
