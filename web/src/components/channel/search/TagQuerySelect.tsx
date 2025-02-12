import { useNavigate } from 'react-router';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TAGS_QUERY_KEY } from '@/common/constants.ts';
import { fetchTags } from '@/client/tag.client.ts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx';
import { TagDto } from '@/client/tag.types.ts';
import { sortedTags } from '@/common/utils.ts';

export function TagQuerySelect() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isTriggered, setIsTriggered] = useState(false);
  const { pageState } = useChannelPageStore();

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
    if (!tag || !pageState) return;
    const newPageState = pageState.new().setTagName(tag.name).build();
    navigate(`/channels?${newPageState.toQueryString()}`);
  };

  const getSelectedNameImpl = () => {
    if (pageState?.tagName) {
      return pageState.tagName;
    }
    if (tags && value) {
      return tagMap.get(value)?.name;
    } else {
      return 'Select Tag...';
    }
  };

  const getCheckedStyle = (tag: TagDto) => {
    const base = 'ml-auto';
    if (pageState?.tagName === tag.name) {
      return cn(base, 'opacity-100');
    } else {
      return cn(base, 'opacity-0');
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
          className="w-[200px] justify-between font-normal"
        >
          {getSelectedNameImpl()}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Input Tag Name..." className="h-9" />
          <CommandList>
            <CommandEmpty>No tag found.</CommandEmpty>
            <CommandGroup>
              {tags &&
                sortedTags(tags).map((tag) => (
                  <CommandItem key={tag.id} value={tag.name} onSelect={onSelect}>
                    {tag.name}
                    <Check className={getCheckedStyle(tag)} />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
