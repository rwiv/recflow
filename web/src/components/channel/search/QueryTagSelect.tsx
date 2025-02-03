import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils.ts';
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
import { useState } from 'react';
import { fetchTags } from '@/client/client.ts';
import { TagRecord } from '@/client/types.ts';

export function QueryTagSelect() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [tags, setTags] = useState<TagRecord[]>([]);

  const onTrigger = async () => {
    if (!open) {
      setTags(await fetchTags());
      setOpen((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  };

  const onSelect = (currentValue: string) => {
    setValue(currentValue === value ? '' : currentValue);
    setOpen(false);
  };

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          onClick={onTrigger}
          className="w-[200px] justify-between"
        >
          {value ? tags.find((tag) => tag.name === value)?.name : 'Select Tag'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Tag..." className="h-9" />
          <CommandList>
            <CommandEmpty>No tag found.</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem key={tag.id} value={tag.name} onSelect={onSelect}>
                  {tag.name}
                  <Check
                    className={cn('ml-auto', value === tag.name ? 'opacity-100' : 'opacity-0')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
