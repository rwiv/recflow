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
import { KeyboardEventHandler, useEffect, useState } from 'react';
import { fetchTags } from '@/client/client.ts';
import { css } from '@emotion/react';
import { TagRecord } from '@/client/types.tag.ts';

export function EditTagSelect({ addTagName }: { addTagName: (tagName: string) => void }) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetchTags().then(setTags);
  }, []);

  const onAddTagName = (tagName: string) => {
    addTagName(tagName);
    setOpen(false);
  };

  const onSelect = (currentValue: string) => {
    onAddTagName(currentValue);
  };

  const onKeydown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (ev.key === 'Enter') {
      onAddTagName(input);
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
