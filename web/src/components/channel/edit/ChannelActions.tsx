import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { MoreHorizontal } from 'lucide-react';
import { useRef } from 'react';
import { TagAttachDialog } from '@/components/channel/edit/TagAttachDialog.tsx';
import { ChannelRecord } from '@/client/channel.types.ts';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { deleteChannel, updateChannelFollowed } from '@/client/channel.client.ts';
import { useQueryClient } from '@tanstack/react-query';
import { CHANNELS_QUERY_KEY } from '@/common/consts.ts';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';

export function ChannelActions({ channel }: { channel: ChannelRecord }) {
  const queryClient = useQueryClient();
  const { pageState } = useChannelPageStore();
  const attachRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  const updateFollowed = async () => {
    await updateChannelFollowed(channel.id, !channel.followed);
    await refresh();
  };

  const onDelete = async () => {
    await deleteChannel(channel.id);
    await refresh();
  };

  const refresh = async () => {
    if (pageState) {
      await queryClient.invalidateQueries({ queryKey: [CHANNELS_QUERY_KEY, pageState.curPageNum] });
    }
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => attachRef.current?.click()}>Attach</DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateFollowed()}>
            {channel.followed ? 'Unfollow' : 'Follow'}
          </DropdownMenuItem>
          <DropdownMenuItem>Update</DropdownMenuItem>
          <DropdownMenuItem onClick={() => deleteRef.current?.click()}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TagAttachDialog channel={channel} triggerRef={attachRef} />
      <DefaultAlertDialog onAction={onDelete} triggerRef={deleteRef} />
    </div>
  );
}
