"use client";

import { useState } from "react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { submitContribution } from "@/lib/api";
import styles from "./contribute.module.css";

const TARGET_MODELS = [
  { value: "ethnic_group", label: "Ethnic Group" },
  { value: "sub_group", label: "Sub Group" },
  { value: "clan", label: "Clan" },
  { value: "language", label: "Language" },
  { value: "traditional_authority", label: "Traditional Authority" },
];

export default function ContributePage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    let proposed: Record<string, unknown>;
    try {
      proposed = JSON.parse(fd.get("proposed_changes") as string || "{}");
    } catch {
      setError("Proposed changes must be valid JSON.");
      return;
    }

    let sources: string[] = [];
    const sourcesRaw = (fd.get("sources") as string).trim();
    if (sourcesRaw) {
      sources = sourcesRaw.split("\n").map((s) => s.trim()).filter(Boolean);
    }

    try {
      await submitContribution({
        contributor_name: fd.get("contributor_name") as string,
        contributor_email: fd.get("contributor_email") as string,
        target_model: fd.get("target_model") as string,
        target_id: parseInt(fd.get("target_id") as string, 10),
        proposed_changes: proposed,
        justification: fd.get("justification") as string,
        sources,
      });
      setSubmitted(true);
    } catch {
      setError("Failed to submit. The API may be unavailable.");
    }
  }

  if (submitted) {
    return (
      <>
        <Nav />
        <div className={styles.page}>
          <div className={styles.success}>
            <h2 className={styles.successTitle}>Thank you!</h2>
            <p className={styles.successBody}>
              Your contribution has been submitted for review. Our team will
              verify the sources and update the database accordingly.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <h1 className={styles.title}>Contribute</h1>
        <p className={styles.sub}>
          Help us build a more accurate database. Propose corrections, additions,
          or new records — all submissions are reviewed and source-verified.
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <label className={styles.label}>
              Your Name
              <input name="contributor_name" required className={styles.input} />
            </label>
            <label className={styles.label}>
              Email
              <input name="contributor_email" type="email" required className={styles.input} />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>
              Target Model
              <select name="target_model" required className={styles.input}>
                {TARGET_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
            <label className={styles.label}>
              Target ID
              <input name="target_id" type="number" required min={1} className={styles.input} />
            </label>
          </div>

          <label className={styles.label}>
            Proposed Changes (JSON)
            <textarea
              name="proposed_changes"
              required
              rows={5}
              className={styles.textarea}
              placeholder='{"totem": "Updated totem name"}'
            />
          </label>

          <label className={styles.label}>
            Justification
            <textarea
              name="justification"
              rows={3}
              className={styles.textarea}
              placeholder="Why should this change be made?"
            />
          </label>

          <label className={styles.label}>
            Sources (one URL per line)
            <textarea
              name="sources"
              rows={3}
              className={styles.textarea}
              placeholder="https://example.com/source"
            />
          </label>

          <button type="submit" className={styles.btn}>Submit Contribution</button>
        </form>
      </div>
      <Footer />
    </>
  );
}
