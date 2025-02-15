import { ReactNode, RefObject } from 'react';
import { SerializedStyles } from '@emotion/react';
import { DialogBase } from '@/components/common/layout/DialogBase.tsx';

interface DialogButtonProps {
  title: string;
  closeRef: RefObject<HTMLButtonElement>;
  triggerRef: RefObject<HTMLButtonElement>;
  children: ReactNode;
  description?: string;
  contentCn?: string;
  contentStyle?: SerializedStyles;
}

export function DialogWithTrigger({
  title,
  closeRef,
  triggerRef,
  children,
  description,
  contentCn,
  contentStyle,
}: DialogButtonProps) {
  return (
    <DialogBase
      title={title}
      closeRef={closeRef}
      triggerNode={<button ref={triggerRef} />}
      description={description}
      contentCn={contentCn}
      contentStyle={contentStyle}
    >
      {children}
    </DialogBase>
  );
}
