import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
import { useChannelPageStore } from '@/entities/channel/channel/model/useChannelPageStore.ts';
import { TAGS_QUERY_KEY } from '@/features/channel/tag/config/constants.ts';
import { TagDto } from '@/entities/channel/tag/model/tag.schema.ts';
import { fetchTags } from '@/features/channel/tag/api/tag.client.ts';
import { cn } from '@/shared/lib/styles/utils.ts';

export function TagQuerySelect({ type }: { type: 'include' | 'exclude' }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isTriggered, setIsTriggered] = useState(false);
  const { pageState, setPageState } = useChannelPageStore();

  const { data: tags } = useQuery({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: fetchTags,
    enabled: isTriggered,
  });

  const getFilteredTags = () => {
    const result: TagDto[] = [];
    if (!tags || !pageState) return undefined;
    const filterTagNames = type === 'include' ? pageState.excludeTags : pageState.includeTags;
    for (const tag of tags) {
      if (!filterTagNames.includes(tag.name)) {
        result.push(tag);
      }
    }
    return result;
  };

  const filteredTags = getFilteredTags();

  const tagMap = useMemo(() => {
    return new Map(filteredTags?.map((tag) => [tag.name, tag]));
  }, [filteredTags]);

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
    const psBuilder = pageState.new();

    const oldTagNames = type === 'include' ? pageState.includeTags : pageState.excludeTags;
    let newTagNames = [];
    if (oldTagNames.includes(tag.name)) {
      newTagNames = [...oldTagNames].filter((name) => name !== tag.name);
    } else {
      newTagNames = [...oldTagNames, tag.name];
    }
    if (type === 'include') {
      psBuilder.setIncludeTags(newTagNames);
    } else {
      psBuilder.setExcludeTags(newTagNames);
    }

    const newPageState = psBuilder.build();
    setPageState(newPageState);
    navigate(`/channels?${newPageState.toQueryString()}`);
  };

  const getSelectedNameImpl = () => {
    const tagNames = type === 'include' ? pageState?.includeTags : pageState?.excludeTags;
    if (tagNames && tagNames.length > 0) {
      return tagNames.join(', ');
    } else {
      return type === 'include' ? 'Include Tag...' : 'Exclude Tag...';
    }
  };

  const getCheckedStyle = (tag: TagDto) => {
    const base = 'ml-auto';
    const tagNames = type === 'include' ? pageState?.includeTags : pageState?.excludeTags;
    const includes = tagNames?.includes(tag.name);
    if (includes) {
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
          className="w-[170px] justify-between font-normal"
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
              {filteredTags &&
                filteredTags.map((tag) => (
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
