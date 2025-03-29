import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { Badge } from '@/components/ui/badge.tsx';

interface SwitchBadgeProps {
  onClick: () => void;
  content: string;
  className?: string;
}

export function SwitchBadge({ onClick, content, className }: SwitchBadgeProps) {
  return (
    <DefaultAlertDialog onAction={onClick}>
      <div className="justify-self-center">
        <button className="uppercase">
          <Badge variant="default" className={className}>
            {content}
          </Badge>
        </button>
      </div>
    </DefaultAlertDialog>
  );
}
