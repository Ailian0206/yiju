"use client";

import styles from "./SuggestionChips.module.css";

interface SuggestionChipsProps {
  suggestions: string[];
  disabled: boolean;
  onPick: (text: string) => void;
}

/** 点了直接提交,不用先打字再回车——降低"不知道打什么"的门槛。 */
export function SuggestionChips({ suggestions, disabled, onPick }: SuggestionChipsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.chips} role="group" aria-label="建议的下一步">
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
