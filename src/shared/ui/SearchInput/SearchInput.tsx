"use client";

import { useState, type ChangeEvent } from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../cx";
import styles from "./SearchInput.module.css";

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Buscar...", className }: SearchInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const currentValue = value ?? internalValue;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    if (value === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  }

  return (
    <label className={cx(styles.wrapper, className)}>
      <span className={styles.icon}>
        <Icon name="search" size={18} />
      </span>
      <input
        type="search"
        className={styles.input}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );
}
