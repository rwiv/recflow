import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { Badge } from '@/components/ui/badge.tsx';

interface SwitchBadgeProps {
  onClick: () => void;
  content: string;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function SwitchBadge({ onClick, content, className, variant }: SwitchBadgeProps) {
  const badgeVariant = variant || 'default';
  return (
    <DefaultAlertDialog onAction={onClick}>
      <div className="justify-self-center">
        <button className="uppercase">
          <Badge variant={badgeVariant} className={className}>
            {content}
          </Badge>
        </button>
      </div>
    </DefaultAlertDialog>
  );
}
