import { ReactNode } from 'react';
import {
  AlertDialog as AlertDialogContainer,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx';

interface AlertDialogProps {
  title: string;
  description: string;
  onAction: () => void;
  children: ReactNode;

  cancelText?: string;
  actionText?: string;
}

export function AlertDialog({
  title,
  description,
  cancelText,
  actionText,
  onAction,
  children,
}: AlertDialogProps) {
  cancelText = cancelText || 'Cancel';
  actionText = actionText || 'Continue';
  return (
    <AlertDialogContainer>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>{actionText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogContainer>
  );
}
