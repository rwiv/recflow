import { ReactNode } from 'react';

interface IconButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function IconButton({ children, className, onClick }: IconButtonProps) {
  return (
    <button
      className={`${className} flex items-center justify-center hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
