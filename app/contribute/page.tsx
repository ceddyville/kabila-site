"use client";

import { useState, useEffect, useCallback } from "react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import {
  submitContribution,
  fetchEthnicGroups,
  fetchEthnicGroupClans,
  fetchEthnicGroupSubGroups,
} from "@/lib/api";
import type { EthnicGroupSummary, ClanSummary, SubGroupSummary } from "@/lib/types";
import styles from "./contribute.module.css";

type Tab = "group" | "subgroup" | "clan" | "correction";

const LINEAGE_OPTIONS = [
  { value: "", label: "— select —" },
  { value: "patrilineal", label: "Patrilineal" },
  { value: "matrilineal", label: "Matrilineal" },
  { value: "bilateral", label: "Bilateral" },
  { value: "ambilineal", label: "Ambilineal" },
];

const SUBGROUP_TYPE_OPTIONS = [
  { value: "", label: "— select —" },
  { value: "sub_tribe", label: "Sub-tribe" },
  { value: "section", label: "Section" },
  { value: "tribe", label: "Tribe" },
  { value: "sub_nation", label: "Sub-nation" },
  { value: "community", label: "Community" },
  { value: "moiety", label: "Moiety" },
  { value: "other", label: "Other" },
];

const CORRECTION_TARGETS = [
  { value: "ethnic_group", label: "Ethnic group record" },
  { value: "clan", label: "Clan record" },
  { value: "sub_group", label: "Sub group record" },
  { value: "language", label: "Language record" },
  { value: "traditional_authority", label: "Traditional authority record" },
];

export default function ContributePage() {
  const [tab, setTab] = useState<Tab>("group");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Clan tab: ethnic group search + clan dropdown ── */
  const [clanEthnicQuery, setClanEthnicQuery] = useState("");
  const [clanEthnicResults, setClanEthnicResults] = useState<EthnicGroupSummary[]>([]);
  const [clanSelectedGroup, setClanSelectedGroup] = useState<EthnicGroupSummary | null>(null);
  const [clanGroupClans, setClanGroupClans] = useState<ClanSummary[]>([]);
  const [isSubClan, setIsSubClan] = useState(false);
  const [loadingClans, setLoadingClans] = useState(false);

  /* ── Clan tab: sub-group autocomplete ── */
  const [clanGroupSubGroups, setClanGroupSubGroups] = useState<SubGroupSummary[]>([]);
  const [clanSelectedSubGroup, setClanSelectedSubGroup] = useState<SubGroupSummary | null>(null);
  const [loadingSubGroups, setLoadingSubGroups] = useState(false);

  // Debounced ethnic group search for clan tab
  useEffect(() => {
    if (clanEthnicQuery.length < 2 || clanSelectedGroup) {
      setClanEthnicResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetchEthnicGroups({ search: clanEthnicQuery });
        setClanEthnicResults(res.results.slice(0, 8));
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [clanEthnicQuery, clanSelectedGroup]);

  // Load clans + sub-groups when ethnic group is selected
  const selectEthnicGroup = useCallback(async (group: EthnicGroupSummary) => {
    setClanSelectedGroup(group);
    setClanEthnicQuery(group.name);
    setClanEthnicResults([]);
    setLoadingClans(true);
    setLoadingSubGroups(true);
    setClanSelectedSubGroup(null);
    try {
      const [clans, subGroups] = await Promise.all([
        fetchEthnicGroupClans(group.id),
        fetchEthnicGroupSubGroups(group.id),
      ]);
      setClanGroupClans(clans);
      setClanGroupSubGroups(subGroups);
    } catch {
      setClanGroupClans([]);
      setClanGroupSubGroups([]);
    } finally {
      setLoadingClans(false);
      setLoadingSubGroups(false);
    }
  }, []);

  const clearEthnicGroup = useCallback(() => {
    setClanSelectedGroup(null);
    setClanEthnicQuery("");
    setClanGroupClans([]);
    setClanGroupSubGroups([]);
    setClanSelectedSubGroup(null);
    setIsSubClan(false);
  }, []);

  async function submit(
    target_model: string,
    target_id: number,
    proposed_changes: Record<string, unknown>,
    justification: string,
    contributor_name: string,
    contributor_email: string,
  ) {
    setError("");
    setLoading(true);
    try {
      await submitContribution({
        contributor_name,
        contributor_email,
        target_model,
        target_id,
        proposed_changes,
        justification,
        sources: [],
      });
      setSubmitted(true);
    } catch {
      setError("Failed to submit. The API may be unavailable.");
    } finally {
      setLoading(false);
    }
  }

  /* ── New Ethnic Group ── */
  function handleGroupSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const changes: Record<string, unknown> = {
      name: fd.get("name"),
      endonym: fd.get("endonym") || undefined,
      lineage_system: fd.get("lineage_system") || undefined,
      primary_language: fd.get("primary_language") || undefined,
      population_estimate: fd.get("population_estimate")
        ? Number(fd.get("population_estimate"))
        : undefined,
      description: fd.get("description") || undefined,
    };
    // remove undefined keys
    Object.keys(changes).forEach((k) => changes[k] === undefined && delete changes[k]);

    const justification = (fd.get("justification") as string) || "";
    submit(
      "ethnic_group", 0, changes, justification,
      fd.get("contributor_name") as string,
      fd.get("contributor_email") as string,
    );
  }

  /* ── New Sub-group ── */
  function handleSubGroupSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const changes: Record<string, unknown> = {
      name: fd.get("name"),
      endonym: fd.get("endonym") || undefined,
      ethnic_group_name: fd.get("ethnic_group_name") || undefined,
      parent_name: fd.get("parent_name") || undefined,
      group_type: fd.get("group_type") || undefined,
      lineage_system: fd.get("lineage_system") || undefined,
      description: fd.get("description") || undefined,
      origin_story: fd.get("origin_story") || undefined,
      population_estimate: fd.get("population_estimate")
        ? Number(fd.get("population_estimate"))
        : undefined,
    };
    Object.keys(changes).forEach((k) => changes[k] === undefined && delete changes[k]);

    const justification = (fd.get("justification") as string) || "";
    submit(
      "sub_group", 0, changes, justification,
      fd.get("contributor_name") as string,
      fd.get("contributor_email") as string,
    );
  }

  /* ── New Clan ── */
  function handleClanSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const changes: Record<string, unknown> = {
      name: fd.get("name"),
      endonym: fd.get("endonym") || undefined,
      ethnic_group_name: clanSelectedGroup?.name || fd.get("ethnic_group_name") || undefined,
      ethnic_group_id: clanSelectedGroup?.id || undefined,
      sub_group_name: clanSelectedSubGroup?.name || fd.get("sub_group_name") || undefined,
      sub_group_id: clanSelectedSubGroup?.id || undefined,
      totem: fd.get("totem") || undefined,
      origin_story: fd.get("origin_story") || undefined,
    };
    if (isSubClan) {
      const parentId = fd.get("parent_clan_id") as string;
      const parentClan = clanGroupClans.find((c) => String(c.id) === parentId);
      if (parentClan) {
        changes.parent_clan_name = parentClan.name;
        changes.parent_clan_id = parentClan.id;
      }
    }
    const taboosRaw = (fd.get("taboos") as string || "").trim();
    if (taboosRaw) {
      changes.taboos = taboosRaw.split(",").map((t) => t.trim()).filter(Boolean);
    }
    Object.keys(changes).forEach((k) => changes[k] === undefined && delete changes[k]);

    const justification = (fd.get("justification") as string) || "";
    submit(
      "clan", 0, changes, justification,
      fd.get("contributor_name") as string,
      fd.get("contributor_email") as string,
    );
  }

  /* ── Correction ── */
  function handleCorrectionSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const field = (fd.get("field_to_correct") as string) || "general";
    const changes: Record<string, unknown> = {
      [field]: fd.get("correct_value"),
      _current_value: fd.get("current_value") || undefined,
    };
    Object.keys(changes).forEach((k) => changes[k] === undefined && delete changes[k]);

    const idRaw = (fd.get("record_id") as string) || "0";
    const targetId = parseInt(idRaw, 10) || 0;
    const reason = (fd.get("reason") as string) || "";
    submit(
      fd.get("target_model") as string,
      targetId, changes, reason,
      fd.get("contributor_name") as string,
      fd.get("contributor_email") as string,
    );
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
              verify the information and update the database accordingly.
            </p>
            <button
              className={styles.btn}
              onClick={() => { setSubmitted(false); setError(""); }}
              style={{ marginTop: 24 }}
            >
              Submit Another
            </button>
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
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>Add data to Kabila</h1>
          </div>

          {/* ── Tabs ── */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === "group" ? styles.tabActive : ""}`}
              onClick={() => setTab("group")}
            >
              New group
            </button>
            <button
              className={`${styles.tab} ${tab === "subgroup" ? styles.tabActive : ""}`}
              onClick={() => setTab("subgroup")}
            >
              New sub-group
            </button>
            <button
              className={`${styles.tab} ${tab === "clan" ? styles.tabActive : ""}`}
              onClick={() => setTab("clan")}
            >
              New clan
            </button>
            <button
              className={`${styles.tab} ${tab === "correction" ? styles.tabActive : ""}`}
              onClick={() => setTab("correction")}
            >
              Correction
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {/* ── New Group Form ── */}
          {tab === "group" && (
            <form onSubmit={handleGroupSubmit} className={styles.form}>
              <div className={styles.row}>
                <label className={styles.label}>
                  Group Name *
                  <input name="name" required className={styles.input} placeholder="e.g. Kalenjin" />
                </label>
                <label className={styles.label}>
                  Endonym *
                  <input name="endonym" required className={styles.input} placeholder="Name in own language" />
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  Country *
                  <input name="country" required className={styles.input} placeholder="e.g. Kenya" />
                </label>
                <label className={styles.label}>
                  Lineage System
                  <select name="lineage_system" className={styles.input}>
                    {LINEAGE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  Primary Language
                  <input name="primary_language" className={styles.input} placeholder="e.g. Kalenjin (ISO: kln)" />
                </label>
                <label className={styles.label}>
                  Population Estimate
                  <input name="population_estimate" type="number" className={styles.input} placeholder="e.g. 4,900,000" />
                </label>
              </div>

              <label className={styles.label}>
                Cultural Description
                <textarea
                  name="description"
                  rows={4}
                  className={styles.textarea}
                  placeholder="Traditional homeland, subsistence practices, governance structures, notable customs…"
                />
              </label>

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>About You</legend>
                <div className={styles.row}>
                  <label className={styles.label}>
                    Your Name
                    <input name="contributor_name" className={styles.input} placeholder="How you'd like to be credited" />
                  </label>
                  <label className={styles.label}>
                    Email
                    <input name="contributor_email" type="email" className={styles.input} placeholder="Optional — for admin follow-up" />
                  </label>
                </div>
              </fieldset>

              <label className={styles.label}>
                Why should we trust this? *
                <textarea
                  name="justification"
                  required
                  rows={3}
                  className={styles.textarea}
                  placeholder="e.g. Member of the Anjirū clan, Murang'a County. Or: linguist at University of Nairobi, citing Leakey's Kikuyu research…"
                />
                <span className={styles.hint}>
                  <strong>This is the most important field.</strong> The admin reads this first when deciding whether to approve.
                </span>
              </label>

              <div className={styles.formFooter}>
                <p className={styles.disclaimer}>
                  All contributions are <strong>reviewed by an admin</strong> before going live.
                  You will be credited when your data is approved.
                </p>
                <button type="submit" disabled={loading} className={styles.btn}>
                  {loading ? "Submitting…" : "Submit →"}
                </button>
              </div>
            </form>
          )}

          {/* ── New Sub-group Form ── */}
          {tab === "subgroup" && (
            <form onSubmit={handleSubGroupSubmit} className={styles.form}>
              <div className={styles.row}>
                <label className={styles.label}>
                  Sub-group Name *
                  <input name="name" required className={styles.input} placeholder="e.g. Nandi, Kipsigis" />
                </label>
                <label className={styles.label}>
                  Endonym
                  <input name="endonym" className={styles.input} placeholder="Name in own language" />
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  Parent Ethnic Group *
                  <input name="ethnic_group_name" required className={styles.input} placeholder="e.g. Kalenjin" />
                </label>
                <label className={styles.label}>
                  Type
                  <select name="group_type" className={styles.input}>
                    {SUBGROUP_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  Parent Sub-group
                  <input name="parent_name" className={styles.input} placeholder="If nested, e.g. Kipsigis under Kalenjin" />
                  <span className={styles.hint}>Leave blank if directly under the ethnic group.</span>
                </label>
                <label className={styles.label}>
                  Lineage System
                  <select name="lineage_system" className={styles.input}>
                    {LINEAGE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  Language
                  <input name="language" className={styles.input} placeholder="e.g. Nandi" />
                </label>
                <label className={styles.label}>
                  Population Estimate
                  <input name="population_estimate" type="number" className={styles.input} placeholder="e.g. 800,000" />
                </label>
              </div>

              <label className={styles.label}>
                Description
                <textarea
                  name="description"
                  rows={3}
                  className={styles.textarea}
                  placeholder="Geographic area, distinguishing cultural features…"
                />
              </label>

              <label className={styles.label}>
                Origin Story / Oral Tradition
                <textarea
                  name="origin_story"
                  rows={3}
                  className={styles.textarea}
                  placeholder="Migration narratives, founding ancestors…"
                />
              </label>

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>About You</legend>
                <div className={styles.row}>
                  <label className={styles.label}>
                    Your Name
                    <input name="contributor_name" className={styles.input} placeholder="How you'd like to be credited" />
                  </label>
                  <label className={styles.label}>
                    Email
                    <input name="contributor_email" type="email" className={styles.input} placeholder="Optional — for admin follow-up" />
                  </label>
                </div>
              </fieldset>

              <label className={styles.label}>
                Why should we trust this? *
                <textarea
                  name="justification"
                  required
                  rows={3}
                  className={styles.textarea}
                  placeholder="e.g. Member of the Nandi community, citing oral history from elders…"
                />
                <span className={styles.hint}>
                  <strong>This is the most important field.</strong> The admin reads this first when deciding whether to approve.
                </span>
              </label>

              <div className={styles.formFooter}>
                <p className={styles.disclaimer}>
                  All contributions are <strong>reviewed by an admin</strong> before going live.
                  You will be credited when your data is approved.
                </p>
                <button type="submit" disabled={loading} className={styles.btn}>
                  {loading ? "Submitting…" : "Submit →"}
                </button>
              </div>
            </form>
          )}

          {/* ── New Clan Form ── */}
          {tab === "clan" && (
            <form onSubmit={handleClanSubmit} className={styles.form}>
              <div className={styles.row}>
                <label className={styles.label}>
                  Clan Name *
                  <input name="name" required className={styles.input} placeholder="e.g. Joka-Jok" />
                </label>
                <label className={styles.label}>
                  Endonym
                  <input name="endonym" className={styles.input} placeholder="Name in own language" />
                </label>
              </div>

              {/* Ethnic group with search */}
              <div className={styles.row}>
                <label className={styles.label}>
                  Ethnic Group *
                  <div className={styles.autocomplete}>
                    <input
                      name="ethnic_group_name"
                      required
                      className={styles.input}
                      placeholder="Start typing, e.g. Luo…"
                      value={clanEthnicQuery}
                      onChange={(e) => {
                        setClanEthnicQuery(e.target.value);
                        if (clanSelectedGroup) clearEthnicGroup();
                      }}
                      autoComplete="off"
                    />
                    {clanSelectedGroup && (
                      <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={clearEthnicGroup}
                        aria-label="Clear selection"
                      >
                        ×
                      </button>
                    )}
                    {clanEthnicResults.length > 0 && (
                      <ul className={styles.dropdown}>
                        {clanEthnicResults.map((g) => (
                          <li key={g.id}>
                            <button
                              type="button"
                              className={styles.dropdownItem}
                              onClick={() => selectEthnicGroup(g)}
                            >
                              {g.name}{g.endonym ? ` (${g.endonym})` : ""}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </label>
                <label className={styles.label}>
                  Sub-group
                  {clanSelectedGroup && !loadingSubGroups && clanGroupSubGroups.length > 0 ? (
                    <>
                      <select
                        name="sub_group_name"
                        className={styles.input}
                        value={clanSelectedSubGroup ? String(clanSelectedSubGroup.id) : ""}
                        onChange={(e) => {
                          const sg = clanGroupSubGroups.find((s) => String(s.id) === e.target.value);
                          setClanSelectedSubGroup(sg || null);
                        }}
                      >
                        <option value="">— none (directly under ethnic group) —</option>
                        {clanGroupSubGroups.map((sg) => (
                          <option key={sg.id} value={sg.id}>
                            {sg.name}{sg.endonym ? ` (${sg.endonym})` : ""}
                          </option>
                        ))}
                      </select>
                      <span className={styles.hint}>
                        Not listed?{" "}
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => setTab("subgroup")}
                        >
                          Suggest a new sub-group first
                        </button>
                      </span>
                    </>
                  ) : clanSelectedGroup && loadingSubGroups ? (
                    <input className={styles.input} disabled placeholder="Loading sub-groups…" />
                  ) : (
                    <>
                      <input name="sub_group_name" className={styles.input} placeholder="e.g. Joka-Jok (if applicable)" />
                      <span className={styles.hint}>
                        {clanSelectedGroup
                          ? `No sub-groups found for ${clanSelectedGroup.name}. Type a name or `
                          : "Select an ethnic group above, or type a sub-group name. "}
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => setTab("subgroup")}
                        >
                          suggest a new sub-group
                        </button>
                      </span>
                    </>
                  )}
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  Totem
                  <input name="totem" className={styles.input} placeholder="e.g. Elephant, Python…" />
                </label>
                <label className={styles.label}>
                  &nbsp;
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isSubClan}
                      onChange={(e) => setIsSubClan(e.target.checked)}
                      className={styles.checkbox}
                    />
                    This is a sub-clan
                  </label>
                </label>
              </div>

              {/* Parent clan dropdown — only shows when "This is a sub-clan" is checked */}
              {isSubClan && (
                <label className={styles.label}>
                  Parent Clan *
                  {clanSelectedGroup && clanGroupClans.length > 0 ? (
                    <select name="parent_clan_id" required className={styles.input}>
                      <option value="">— select parent clan —</option>
                      {clanGroupClans.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}{c.endonym ? ` (${c.endonym})` : ""}
                        </option>
                      ))}
                    </select>
                  ) : clanSelectedGroup && loadingClans ? (
                    <input className={styles.input} disabled placeholder="Loading clans…" />
                  ) : clanSelectedGroup && clanGroupClans.length === 0 ? (
                    <>
                      <input name="parent_clan_name" required className={styles.input} placeholder="No clans found — type the parent clan name" />
                      <span className={styles.hint}>No existing clans found for {clanSelectedGroup.name}. Type the parent clan name manually.</span>
                    </>
                  ) : (
                    <>
                      <input name="parent_clan_name" required className={styles.input} placeholder="Select an ethnic group first, or type the parent clan name" />
                      <span className={styles.hint}>Select an ethnic group above to see a dropdown of existing clans.</span>
                    </>
                  )}
                </label>
              )}

              <label className={styles.label}>
                Origin Story / Oral Tradition
                <textarea
                  name="origin_story"
                  rows={4}
                  className={styles.textarea}
                  placeholder="How did this clan come to be? Founding ancestor, migration narrative, or oral tradition…"
                />
              </label>

              <label className={styles.label}>
                Known Taboos
                <input name="taboos" className={styles.input} placeholder="e.g. Cannot eat elephant meat, cannot cut fig trees" />
                <span className={styles.hint}>Separate multiple taboos with commas.</span>
              </label>

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>About You</legend>
                <div className={styles.row}>
                  <label className={styles.label}>
                    Your Name
                    <input name="contributor_name" className={styles.input} placeholder="How you'd like to be credited" />
                  </label>
                  <label className={styles.label}>
                    Email
                    <input name="contributor_email" type="email" className={styles.input} placeholder="Optional — for admin follow-up" />
                  </label>
                </div>
              </fieldset>

              <label className={styles.label}>
                Why should we trust this? *
                <textarea
                  name="justification"
                  required
                  rows={3}
                  className={styles.textarea}
                  placeholder="e.g. Member of the Anjirū clan, Murang'a County. Or: linguist at University of Nairobi, citing Leakey's Kikuyu research…"
                />
                <span className={styles.hint}>
                  <strong>This is the most important field.</strong> The admin reads this first when deciding whether to approve.
                </span>
              </label>

              <div className={styles.formFooter}>
                <p className={styles.disclaimer}>
                  All contributions are <strong>reviewed by an admin</strong> before going live.
                  You will be credited when your data is approved.
                </p>
                <button type="submit" disabled={loading} className={styles.btn}>
                  {loading ? "Submitting…" : "Submit →"}
                </button>
              </div>
            </form>
          )}

          {/* ── Correction Form ── */}
          {tab === "correction" && (
            <form onSubmit={handleCorrectionSubmit} className={styles.form}>
              <label className={styles.label}>
                What record needs correcting? *
                <select name="target_model" required className={styles.input}>
                  {CORRECTION_TARGETS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>

              <div className={styles.row}>
                <label className={styles.label}>
                  Record Name / ID
                  <input name="record_id" className={styles.input} placeholder="e.g. Kikuyu, or ID: 1" />
                </label>
                <label className={styles.label}>
                  Field to Correct
                  <input name="field_to_correct" className={styles.input} placeholder="e.g. lineage_system, totem" />
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  Current (Wrong) Value
                  <input name="current_value" className={styles.input} placeholder="What it currently says" />
                </label>
                <label className={styles.label}>
                  Correct Value *
                  <input name="correct_value" required className={styles.input} placeholder="What it should say" />
                </label>
              </div>

              <label className={styles.label}>
                Reason / Source
                <textarea
                  name="reason"
                  rows={4}
                  className={styles.textarea}
                  placeholder="Why is this wrong? Cite a source, oral tradition, or your expertise."
                />
              </label>

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>About You</legend>
                <div className={styles.row}>
                  <label className={styles.label}>
                    Your Name
                    <input name="contributor_name" className={styles.input} placeholder="How you'd like to be credited" />
                  </label>
                  <label className={styles.label}>
                    Email
                    <input name="contributor_email" type="email" className={styles.input} placeholder="Optional — for admin follow-up" />
                  </label>
                </div>
              </fieldset>

              <label className={styles.label}>
                Why should we trust this? *
                <textarea
                  name="justification"
                  required
                  rows={3}
                  className={styles.textarea}
                  placeholder="e.g. Member of the Anjirū clan, Murang'a County. Or: linguist at University of Nairobi, citing Leakey's Kikuyu research…"
                />
                <span className={styles.hint}>
                  <strong>This is the most important field.</strong> The admin reads this first when deciding whether to approve.
                </span>
              </label>

              <div className={styles.formFooter}>
                <p className={styles.disclaimer}>
                  All contributions are <strong>reviewed by an admin</strong> before going live.
                  You will be credited when your data is approved.
                </p>
                <button type="submit" disabled={loading} className={styles.btn}>
                  {loading ? "Submitting…" : "Submit →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
