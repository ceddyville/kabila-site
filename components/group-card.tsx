import Link from "next/link";
import styles from "./group-card.module.css";

interface Stat {
  label: string;
  value: number;
}

interface GroupCardProps {
  id: number;
  name: string;
  endonym?: string;
  extra?: string;
  stats?: Stat[];
  badge?: string;
  href: string;
}

export default function GroupCard({ id, name, endonym, extra, stats, badge, href }: GroupCardProps) {
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.top}>
        <h3 className={styles.name}>{name}</h3>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>
      {endonym && <p className={styles.endonym}>{endonym}</p>}
      {stats && stats.length > 0 && (
        <div className={styles.stats}>
          {stats.map((s) => (
            <span key={s.label} className={styles.stat}>
              <strong>{s.value}</strong> {s.label}
            </span>
          ))}
        </div>
      )}
      {extra && <p className={styles.extra}>{extra}</p>}
    </Link>
  );
}
