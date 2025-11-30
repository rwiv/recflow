import { css } from '@emotion/react';
import { KeyboardEventHandler, MouseEventHandler, ReactNode, useEffect, useRef, useState } from 'react';
import { ZodError } from 'zod';

import { zodErrMsg } from '@/shared/lib/schema/schema_utils.ts';
import { toast } from '@/shared/model/use-toast.ts';
import { Input } from '@/shared/ui/cn/input.tsx';
import { DefaultAlertDialog } from '@/shared/ui/dialog/AlertDialog.tsx';

interface TextUpdateFormProps {
  submit: (value: string) => void;
  validate: (value: string) => void;
  children: ReactNode;
  defaultValue?: string;
}

export function TextUpdateForm({ submit, children, validate, defaultValue }: TextUpdateFormProps) {
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
    try {
      validate(input);
      setIsEditing(false);
      setInput(input);
      submit(input);
    } catch (e) {
      console.error(e);
      if (e instanceof ZodError) {
        toast({ title: 'Invalid input', description: zodErrMsg(e) });
      } else if (e instanceof Error) {
        toast({ title: 'Invalid input', description: `${e.message}` });
      } else {
        toast({ title: 'Invalid input', description: 'Unknown error' });
      }
    }
  };

  const cancel = () => {
    setIsEditing(false);
    setInput(defaultValue ?? '');
  };

  const onInputKeydown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (input === defaultValue) {
        setIsEditing(false);
      } else {
        triggerRef.current?.click();
      }
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
      <div ref={valueRef} className="min-h-5" css={getStyle(isEditing)} onMouseDown={onValueMouseDown}>
        {children}
      </div>
      <div className="flex flex-row justify-self-center" css={css({ ...getStyle(!isEditing), width })}>
        <Input
          css={css({ height: '2rem' })}
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
