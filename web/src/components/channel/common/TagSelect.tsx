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
import { useMemo, useState } from 'react';
import { fetchTags } from '@/client/client.ts';
import { useQuery } from '@tanstack/react-query';
import { TAGS_QUERY_KEY } from '@/common/consts.ts';
import { TagRecord } from '@/client/types.tag.ts';

interface TagSelectProps {
  onSelectCallback: (tag: TagRecord) => void;
}

export function TagSelect({ onSelectCallback }: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isTriggered, setIsTriggered] = useState(false);

  const { data: tags } = useQuery({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: fetchTags,
    enabled: isTriggered,
  });

  const tagMap = useMemo(() => {
    return new Map(tags?.map((tag) => [tag.name, tag]));
  }, [tags]);

  const onTrigger = async () => {
    if (!isTriggered) {
      setIsTriggered(true);
    }
  };

  const onSelect = (selectedValue: string) => {
    setValue(selectedValue === value ? '' : selectedValue);
    setOpen(false);
    const tag = tagMap.get(selectedValue);
    if (tag) {
      onSelectCallback(tag);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          onClick={onTrigger}
          className="w-[200px] justify-between"
        >
          {tags && value ? tagMap.get(value)?.name : 'Select Tag'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Tag..." className="h-9" />
          <CommandList>
            <CommandEmpty>No tag found.</CommandEmpty>
            <CommandGroup>
              {tags &&
                tags.map((tag) => (
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
