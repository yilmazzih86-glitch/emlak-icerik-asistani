import styles from './Avatar.module.scss';

interface AvatarProps {
  name: string;
  src?: string | null;
}

export const Avatar = ({ name, src }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={styles.avatar}>
      {src ? <img src={src} alt={name} /> : <span>{initials}</span>}
    </div>
  );
};