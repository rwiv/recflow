import { ReactNode, RefObject } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/cn/dialog.tsx';
import { DialogClose } from '@radix-ui/react-dialog';
import { SerializedStyles } from '@emotion/react';
import { cn } from '@/shared/lib/styles/utils.ts';

interface DialogBaseProps {
  title: string;
  closeRef: RefObject<HTMLButtonElement>;
  triggerNode: ReactNode;
  children: ReactNode;
  description?: string;
  contentCn?: string;
  contentStyle?: SerializedStyles;
}

export function DialogBase({
  title,
  closeRef,
  children,
  triggerNode,
  description,
  contentCn,
  contentStyle,
}: DialogBaseProps) {
  const defaultCn = 'sm:max-w-md';
  const className = cn(defaultCn, contentCn);
  description = description || "Click save when you're done.";
  return (
    <Dialog>
      <DialogTrigger asChild>{triggerNode}</DialogTrigger>
      <DialogContent className={className} css={contentStyle}>
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
