import React from 'react';
import styles from './Badge.module.scss';
import clsx from 'clsx';

export type BadgeVariant = 'default' | 'info' | 'warning' | 'success' | 'danger' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  return (
    <span className={clsx(styles.badge, styles[`badge--${variant}`], className)}>
      {children}
    </span>
  );
};