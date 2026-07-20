"use client";

import { useState, type FormEvent } from "react";
import styles from "./ActionInput.module.css";

interface ActionInputProps {
  disabled: boolean;
  onSubmit: (text: string) => void;
}

export function ActionInput({ disabled, onSubmit }: ActionInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="输入你想做的事……"
        aria-label="输入你想做的事"
        disabled={disabled}
        autoComplete="off"
      />
      <button type="submit" className={styles.submit} disabled={disabled || value.trim().length === 0}>
        行动
      </button>
    </form>
  );
}
