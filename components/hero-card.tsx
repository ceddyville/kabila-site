import styles from "./hero-card.module.css";

export default function HeroCard() {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.title}>Kikuyu &middot; Ag&#297;k&#361;y&#361;</span>
        <span className={styles.badge}>Kenya</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Clan</span>
        <span className={styles.value}>Anjir&#363;</span>
        <span className={styles.meta}>Totem: Elephant</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Clan</span>
        <span className={styles.value}>Acheera</span>
        <span className={styles.meta}>Totem: Colobus monkey</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Clan</span>
        <span className={styles.value}>Ambui</span>
        <span className={styles.meta}>Totem: Dove</span>
      </div>
      <div className={styles.rowLast}>
        <span className={styles.label}>Clan</span>
        <span className={styles.value}>Angari</span>
        <span className={styles.meta}>Totem: Serval cat</span>
      </div>
      <div className={styles.foot}>
        <div className={styles.footItem}>
          <div className={styles.footLabel}>Lineage</div>
          <div className={styles.footValue}>Patrilineal</div>
        </div>
        <div className={styles.footItem}>
          <div className={styles.footLabel}>Clans</div>
          <div className={styles.footValue}>9</div>
        </div>
        <div className={styles.footItem}>
          <div className={styles.footLabel}>Speakers</div>
          <div className={styles.footValue}>8.1M</div>
        </div>
      </div>
    </div>
  );
}
