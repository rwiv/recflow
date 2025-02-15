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
import { ChannelDto } from '@/client/channel.types.ts';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { deleteChannel, updateChannelFollowed } from '@/client/channel.client.ts';
import { useQueryClient } from '@tanstack/react-query';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { ChannelUpdateDialog } from '@/components/channel/edit/ChannelUpdateDialog.tsx';

export function ChannelActions({ channel }: { channel: ChannelDto }) {
  const queryClient = useQueryClient();
  const { pageState } = useChannelPageStore();
  const attachRef = useRef<HTMLButtonElement>(null);
  const updateRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  const updateFollowed = async () => {
    await updateChannelFollowed(channel.id, !channel.isFollowed);
    await refresh();
  };

  const onDelete = async () => {
    await deleteChannel(channel.id);
    await refresh();
  };

  const refresh = async () => {
    if (!pageState) return;
    await queryClient.invalidateQueries({ queryKey: pageState.queryKeys() });
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => attachRef.current?.click()}>Attach</DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateRef.current?.click()}>Update</DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateFollowed()}>
            {channel.isFollowed ? 'Unfollow' : 'Follow'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => deleteRef.current?.click()}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TagAttachDialog channel={channel} triggerRef={attachRef} />
      <ChannelUpdateDialog channel={channel} triggerRef={updateRef} />
      <DefaultAlertDialog onAction={onDelete} triggerRef={deleteRef} />
    </div>
  );
}
