import styles from './Avatar.module.scss';
import clsx from 'clsx'; // Badge.tsx'te kullanılmış, burada da kullanıyoruz

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Yeni boyut prop'u
  className?: string;
}

export const Avatar = ({ name, src, size = 'md', className }: AvatarProps) => {
  // İsimden baş harfleri türetme
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={clsx(styles.avatar, styles[`avatar--${size}`], className)}>
      {src ? <img src={src} alt={name} /> : <span>{initials}</span>}
    </div>
  );
};