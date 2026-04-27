"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./filter-chips.module.css";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterChipsProps {
  paramName: string;
  options: FilterOption[];
}

export default function FilterChips({ paramName, options }: FilterChipsProps) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get(paramName) ?? "";

  function toggle(value: string) {
    const sp = new URLSearchParams(params.toString());
    if (active === value) {
      sp.delete(paramName);
    } else {
      sp.set(paramName, value);
    }
    sp.delete("page");
    router.push(`?${sp.toString()}`);
  }

  return (
    <div className={styles.row}>
      {options.map((o) => (
        <button
          key={o.value}
          className={`${styles.chip} ${active === o.value ? styles.active : ""}`}
          onClick={() => toggle(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
