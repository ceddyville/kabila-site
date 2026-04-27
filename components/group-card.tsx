import Link from "next/link";
import styles from "./group-card.module.css";

interface GroupCardProps {
  id: number;
  name: string;
  endonym?: string;
  extra?: string;
  badge?: string;
  href: string;
}

export default function GroupCard({ id, name, endonym, extra, badge, href }: GroupCardProps) {
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.top}>
        <h3 className={styles.name}>{name}</h3>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>
      {endonym && <p className={styles.endonym}>{endonym}</p>}
      {extra && <p className={styles.extra}>{extra}</p>}
    </Link>
  );
}
