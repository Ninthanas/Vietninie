import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';
export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  return (
    <button
      {...props}
      className={styles.button + ' ' + styles[variant] + ' ' + className}
    />
  );
}
