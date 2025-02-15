import { ReactNode, RefObject } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { DialogClose } from '@radix-ui/react-dialog';
import { SerializedStyles } from '@emotion/react';

interface DialogButtonProps {
  label: string;
  title: string;
  closeRef: RefObject<HTMLButtonElement>;
  children: ReactNode;
  description?: string;
  buttonCn?: string;
  buttonStyle?: SerializedStyles;
  buttonVariant?: 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | null;
  contentCn?: string;
  contentStyle?: SerializedStyles;
}

export function DialogButton({
  label,
  title,
  closeRef,
  children,
  description,
  buttonVariant,
  buttonCn,
  buttonStyle,
  contentCn,
  contentStyle,
}: DialogButtonProps) {
  buttonVariant = buttonVariant || 'secondary';
  description = description || "Click save when you're done.";
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className={buttonCn} css={buttonStyle}>
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className={contentCn} css={contentStyle}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogClose ref={closeRef} />
      </DialogContent>
    </Dialog>
  );
}
