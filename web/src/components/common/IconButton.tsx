import { ReactNode } from 'react';
import { cn } from '@/lib/utils.ts';

interface IconButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function IconButton({ children, className, onClick }: IconButtonProps) {
  return (
    <button
      className={cn(
        'flex items-center justify-center hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
