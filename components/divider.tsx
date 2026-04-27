import styles from "./divider.module.css";

export default function Divider() {
  return (
    <div className={styles.divider}>
      <div className={styles.line} />
      <div className={styles.mark} />
      <div className={styles.line} />
    </div>
  );
}
