import { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui/cn/dropdown-menu.tsx';
import { Badge } from '@shared/ui/cn/badge.tsx';
import { TagDto } from '@entities/channel/tag/api/tag.schema.ts';
import { ChannelDto } from '@entities/channel/channel/api/channel.types.ts';
import { useChannelPageStore } from '@entities/channel/channel/model/useChannelPageStore.ts';
import { detachTag } from '@entities/channel/tag/api/tag.client.ts';
import { DefaultAlertDialog } from '@shared/ui/dialog/AlertDialog.tsx';
import { TAGS_QUERY_KEY } from '@pages/channel/tag/config/constants.ts';

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
