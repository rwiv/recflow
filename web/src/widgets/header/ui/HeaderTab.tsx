import { ReactNode } from 'react';
import { cn } from '@/shared/lib/styles/utils.ts';

interface HeaderTabListProps {
  children: ReactNode;
  className?: string;
}

export function HeaderTabList({ children, className }: HeaderTabListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface HeaderTabButtonProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function HeaderTabButton({ active, children, className, onClick }: HeaderTabButtonProps) {
  const activeCn = active ? 'bg-background text-foreground shadow ' : '';

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className,
        activeCn,
      )}
    >
      {children}
    </button>
  );
}
