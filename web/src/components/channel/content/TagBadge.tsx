import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { TagRecord } from '@/client/tag.types.ts';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { useRef } from 'react';
import { CHANNELS_QUERY_KEY, TAGS_QUERY_KEY } from '@/common/consts.ts';
import { useQueryClient } from '@tanstack/react-query';
import { ChannelRecord } from '@/client/channel.types.ts';
import { detachTag } from '@/client/tag.client.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';

interface TagBadgeProps {
  tag: TagRecord;
  channel: ChannelRecord;
}

export function TagBadge({ tag, channel }: TagBadgeProps) {
  const queryClient = useQueryClient();
  const detachRef = useRef<HTMLButtonElement>(null);
  const { pageState } = useChannelPageStore();

  const onDetach = async () => {
    await detachTag({ channelId: channel.id, tagId: tag.id });
    queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    if (pageState) {
      queryClient.invalidateQueries({ queryKey: [CHANNELS_QUERY_KEY, pageState.curPageNum] });
    }
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
