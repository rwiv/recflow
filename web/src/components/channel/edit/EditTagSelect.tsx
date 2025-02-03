import { ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Dispatch, KeyboardEventHandler, SetStateAction, useEffect, useState } from 'react';
import { fetchTags } from '@/client/client.ts';
import { TagRecord } from '@/client/types.ts';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { ControllerRenderProps } from 'react-hook-form';
import { EditFormProps, EditForm } from '@/components/channel/form/types.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { css } from '@emotion/react';

export function TagSelectField({ form }: { form: EditForm }) {
  const [tagNames, setTagNames] = useState<string[]>([]);
  return (
    <div>
      <FormField
        control={form.control}
        name="tagNames"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <div>
                <EditTagSelect field={field} setTagNames={setTagNames} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex gap-1 my-3">
        {tagNames.map((tagName, i) => (
          <Badge key={i}>{tagName}</Badge>
        ))}
      </div>
    </div>
  );
}

interface SelectProps {
  field: ControllerRenderProps<EditFormProps, 'tagNames'>;
  setTagNames: Dispatch<SetStateAction<string[]>>;
}

export function EditTagSelect({ field, setTagNames }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetchTags().then(setTags);
  }, []);

  const addTagName = (tagName: string) => {
    field.onChange([...field.value, tagName]);
    setTagNames([...field.value, tagName]);
    setOpen(false);
  };

  const onSelect = (currentValue: string) => {
    addTagName(currentValue);
  };

  const onKeydown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (ev.key === 'Enter') {
      addTagName(input);
      setInput('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          Select Tag
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" css={css({ width: '25rem' })}>
        <Command>
          <CommandInput
            placeholder="Search Tag..."
            value={input}
            onInput={(ev) => setInput(ev.currentTarget.value)}
            className="h-9"
            onKeyDown={onKeydown}
          />
          <CommandList>
            <CommandEmpty>No tag found.</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem key={tag.id} value={tag.name} onSelect={onSelect}>
                  {tag.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
