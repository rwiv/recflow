import { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui/cn/dropdown-menu.tsx';
import { Badge } from '@shared/ui/cn/badge.tsx';
import { DefaultAlertDialog } from '@shared/ui/dialog';
import { ChannelDto, useChannelPageStore } from '@entities/channel/channel';
import { TagDto, detachTag, TAGS_QUERY_KEY } from '@entities/channel/tag';

interface TagBadgeProps {
  tag: TagDto;
  channel: ChannelDto;
}

export function TagBadge({ tag, channel }: TagBadgeProps) {
  const queryClient = useQueryClient();
  const detachRef = useRef<HTMLButtonElement>(null);
  const { pageState } = useChannelPageStore();

  const onDetach = async () => {
    if (!pageState) return;
    await detachTag({ channelId: channel.id, tagId: tag.id });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: pageState.queryKeys() }),
    ]);
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button key={tag.id}>
            <Badge variant="secondary">{tag.name}</Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Search</DropdownMenuItem>
          <DropdownMenuItem>Details</DropdownMenuItem>
          <DropdownMenuItem>Update</DropdownMenuItem>
          <DropdownMenuItem onClick={() => detachRef.current?.click()}>Detach</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DefaultAlertDialog onAction={onDetach} triggerRef={detachRef} />
    </div>
  );
}
