import { ReactNode, RefObject } from 'react';
import { Button } from '@/shared/ui/cn/button.tsx';
import { SerializedStyles } from '@emotion/react';
import { DialogBase } from '@/shared/ui/dialog/DialogBase.tsx';

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
  return (
    <DialogBase
      title={title}
      closeRef={closeRef}
      triggerNode={
        <Button variant={buttonVariant} className={buttonCn} css={buttonStyle}>
          {label}
        </Button>
      }
      description={description}
      contentCn={contentCn}
      contentStyle={contentStyle}
    >
      {children}
    </DialogBase>
  );
}
