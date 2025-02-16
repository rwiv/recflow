import { KeyboardEventHandler, MouseEventHandler, ReactNode, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { css } from '@emotion/react';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';

interface TextUpdateFormProps {
  submit: (value: string) => void;
  children: ReactNode;
  defaultValue?: string;
}

export function TextUpdateForm({ submit, children, defaultValue }: TextUpdateFormProps) {
  const valueRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(defaultValue ?? '');
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!valueRef.current) return;
    const style = window.getComputedStyle(valueRef.current);
    const width = parseFloat(style.width);
    setWidth(width);
  }, [valueRef]);

  const save = () => {
    setIsEditing(false);
    setInput(input);
    submit(input);
  };

  const cancel = () => {
    setIsEditing(false);
    setInput(defaultValue ?? '');
  };

  const onInputKeydown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      triggerRef.current?.click();
    } else if (ev.key === 'Escape') {
      cancel();
    }
  };

  const onInputMouseDown: MouseEventHandler<HTMLInputElement> = (ev) => {
    if (ev.button === 1) {
      cancel();
    }
  };

  const onValueMouseDown: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (ev.button === 1) {
      setIsEditing(true);
    }
  };

  const getStyle = (flag: boolean) => {
    if (flag) {
      return css({ display: 'none' });
    } else {
      return css();
    }
  };

  return (
    <>
      <div ref={valueRef} css={getStyle(isEditing)} onMouseDown={onValueMouseDown}>
        {children}
      </div>
      <div className="flex flex-row justify-self-center" css={css({ ...getStyle(!isEditing), width })}>
        <Input
          value={input}
          onKeyDown={onInputKeydown}
          onMouseDown={onInputMouseDown}
          onChange={(ev) => setInput(ev.target.value)}
        />
      </div>
      <div css={css({ display: 'none' })}>
        <DefaultAlertDialog onAction={save} triggerRef={triggerRef} />
      </div>
    </>
  );
}
