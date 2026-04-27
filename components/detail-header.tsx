import styles from "./detail-header.module.css";

interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function DetailHeader({ title, subtitle, badge }: DetailHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
  );
}
