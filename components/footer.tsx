import MaasaiStripe from "./maasai-stripe";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.stripeWrap}>
        <MaasaiStripe />
      </div>
      <p className={styles.text}>
        &copy; 2026 <a href="https://kabila.dev">Imara Tech</a> &middot;{" "}
        <a href="/docs">API Docs</a> &middot;{" "}
        <a href="/contribute">Contribute</a>
      </p>
    </footer>
  );
}
