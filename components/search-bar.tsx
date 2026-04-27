"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./search-bar.module.css";

export default function SearchBar({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = (fd.get("q") as string).trim();
    const sp = new URLSearchParams(params.toString());
    if (q) {
      sp.set("search", q);
    } else {
      sp.delete("search");
    }
    sp.delete("page");
    router.push(`?${sp.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        name="q"
        type="text"
        defaultValue={params.get("search") ?? ""}
        placeholder={placeholder}
        className={styles.input}
      />
      <button type="submit" className={styles.btn}>Search</button>
    </form>
  );
}
