"use client";

import styles from "./SuggestionChips.module.css";

interface SuggestionChipsProps {
  suggestions: string[];
  disabled: boolean;
  onPick: (text: string) => void;
}

/** 开局或卡住时出现;点了直接提交,降低空白输入门槛。 */
export function SuggestionChips({ suggestions, disabled, onPick }: SuggestionChipsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.chips} role="group" aria-label="建议的下一步">
      <p className={styles.hint}>下一步可以试试</p>
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          className={styles.chip}
          disabled={disabled}
          onClick={() => onPick(text)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
