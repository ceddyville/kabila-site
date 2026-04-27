import Link from "next/link";
import MaasaiStripe from "./maasai-stripe";
import styles from "./nav.module.css";

function KabilaIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#e8b030" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="5" r="3" />
      <circle cx="5" cy="14" r="2.5" />
      <circle cx="19" cy="14" r="2.5" />
      <path d="M12 8v3" />
      <path d="M8 13l-1.5-1" />
      <path d="M16 13l1.5-1" />
      <circle cx="12" cy="19" r="2" />
      <path d="M12 15v2" />
    </svg>
  );
}

export default function Nav() {
  return (
    <nav className={styles.nav} style={{ position: "relative" }}>
      <Link href="/" className={styles.brand}>
        <div className={styles.mark}>
          <KabilaIcon />
        </div>
        <span className={styles.name}>Kabila</span>
        <span className={styles.tag}>African Peoples &amp; Lineages</span>
      </Link>
      <div className={styles.links}>
        <Link href="/ethnic-groups" className={styles.link}>Ethnic Groups</Link>
        <Link href="/clans" className={styles.link}>Clans</Link>
        <Link href="/languages" className={styles.link}>Languages</Link>
        <Link href="/docs" className={styles.link}>API</Link>
        <Link href="/contribute" className={styles.btnPrimary}>Contribute</Link>
      </div>
      <div className={styles.stripeWrap}>
        <MaasaiStripe />
      </div>
    </nav>
  );
}
