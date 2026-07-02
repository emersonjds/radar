import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cx } from "../cx";
import styles from "./Table.module.css";

export type TableProps = TableHTMLAttributes<HTMLTableElement>;
export type TheadProps = HTMLAttributes<HTMLTableSectionElement>;
export type TbodyProps = HTMLAttributes<HTMLTableSectionElement>;
export type TrProps = HTMLAttributes<HTMLTableRowElement>;
export type ThProps = ThHTMLAttributes<HTMLTableCellElement>;
export type TdProps = TdHTMLAttributes<HTMLTableCellElement>;

export function Table({ className, ...rest }: TableProps) {
  return <table className={cx(styles.table, className)} {...rest} />;
}

export function THead({ className, ...rest }: TheadProps) {
  return <thead className={cx(styles.thead, className)} {...rest} />;
}

export function TBody({ className, ...rest }: TbodyProps) {
  return <tbody className={cx(styles.tbody, className)} {...rest} />;
}

export function TR({ className, ...rest }: TrProps) {
  return <tr className={cx(styles.tr, className)} {...rest} />;
}

export function TH({ className, ...rest }: ThProps) {
  return <th className={cx(styles.th, className)} {...rest} />;
}

export function TD({ className, ...rest }: TdProps) {
  return <td className={cx(styles.td, className)} {...rest} />;
}
