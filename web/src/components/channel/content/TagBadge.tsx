import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { TagDto } from '@/client/channel/tag.schema.ts';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { useRef } from 'react';
import { TAGS_QUERY_KEY } from '@/common/constants.ts';
import { useQueryClient } from '@tanstack/react-query';
import { ChannelDto } from '@/client/channel/channel.types.ts';
import { detachTag } from '@/client/channel/tag.client.ts';
import { useChannelPageStore } from '@/hooks/channel/useChannelPageStore.ts';

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
