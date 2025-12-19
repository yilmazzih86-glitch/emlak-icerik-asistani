import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.scss';
import clsx from 'clsx'; // Sınıfları birleştirmek için

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'default' | 'sm';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  isLoading, 
  icon, 
  className, 
  disabled, 
  ...props 
}: ButtonProps) => {
  return (
    <button 
      className={clsx(
        styles.btn, 
        styles[`btn--${variant}`], 
        styles[`btn--${size}`],
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <>
          {icon && <span style={{ display: 'flex' }}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};