import { ReactNode, RefObject } from 'react';
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

interface DefaultAlertDialogProps {
  onAction: () => void;
  children?: ReactNode;
  triggerRef?: RefObject<HTMLButtonElement>;
}

export function DefaultAlertDialog({ children, onAction, triggerRef }: DefaultAlertDialogProps) {
  return (
    <AlertDialog
      title="Are you absolutely sure?"
      description={'This action cannot be undone. This will permanently delete data.'}
      triggerRef={triggerRef}
      onAction={onAction}
    >
      {children}
    </AlertDialog>
  );
}

interface AlertDialogProps {
  title: string;
  description: string;
  onAction: () => void;
  children: ReactNode;

  cancelText?: string;
  actionText?: string;
  triggerRef?: RefObject<HTMLButtonElement>;
}

export function AlertDialog({
  title,
  description,
  cancelText,
  actionText,
  onAction,
  children,
  triggerRef,
}: AlertDialogProps) {
  cancelText = cancelText || 'Cancel';
  actionText = actionText || 'Continue';
  return (
    <AlertDialogContainer>
      {triggerRef ? (
        <AlertDialogTrigger asChild>
          <button ref={triggerRef} />
        </AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      )}
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
