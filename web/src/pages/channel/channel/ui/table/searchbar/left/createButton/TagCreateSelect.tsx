import { KeyboardEventHandler, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { css } from '@emotion/react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/cn/command.tsx';
import { Button } from '@/shared/ui/cn/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/cn/popover.tsx';
import { useQuery } from '@tanstack/react-query';
import { TAGS_QUERY_KEY } from '@/pages/channel/tag/config/constants.ts';
import { fetchTags } from '@/entities/channel/tag/api/tag.client.ts';
import { TagDto } from '@/entities/channel/tag/api/tag.schema.ts';

interface EditTagSelectProps {
  existsTagNames: string[];
  addTagName: (tagName: string) => void;
}

export function TagCreateSelect({ existsTagNames, addTagName }: EditTagSelectProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  const { data: tags } = useQuery({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: fetchTags,
  });

  const onAddTagName = (tagName: string) => {
    addTagName(tagName);
    setOpen(false);
  };

  const onSelect = (currentValue: string) => {
    onAddTagName(currentValue);
  };

  const onKeydown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (ev.key !== 'Enter') return;
    onAddTagName(input);
    setInput('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between opacity-60 font-normal"
        >
          Select Tags...
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="p-0" css={css({ width: '25rem' })}>
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
              {tags &&
                nonDuplicatedSortedTags(existsTagNames, tags).map((tag) => (
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

function nonDuplicatedSortedTags(exists: string[], reqTags: TagDto[]): TagDto[] {
  const tagSet = new Set(exists);
  const tags = reqTags.filter((tag) => !tagSet.has(tag.name));
  return tags.sort((a, b) => a.name.localeCompare(b.name));
}
