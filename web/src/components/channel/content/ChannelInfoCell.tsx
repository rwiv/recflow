import { getChannelUrl } from '@/lib/platform.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { ChannelDto } from '@/client/channel/channel.types.ts';
import { cn } from '@/lib/utils.ts';
import { SerializedStyles } from '@emotion/react';

interface ChannelInfoCellProps {
  channel: ChannelDto;
  className?: string;
  css?: SerializedStyles;
}

export function ChannelInfoCell({ channel, className, css }: ChannelInfoCellProps) {
  return (
    <div className={cn('flex flex-row flex-wrap items-center ml-1', className)} css={css}>
      <a href={getChannelUrl(channel.platform.name, channel.pid)}>
        <Avatar className="w-9 h-9">
          <AvatarImage src={channel.profileImgUrl ?? ''} />
          <AvatarFallback>
            <Skeleton className="rounded-full" />
          </AvatarFallback>
        </Avatar>
      </a>
      <div className="center ml-5 mr-1 font-medium">
        <a href={getChannelUrl(channel.platform.name, channel.pid)}>{channel.username}</a>
      </div>
      <div>
        <img src={getSvgSrc(channel.platform.name)} alt="platform type" />
      </div>
    </div>
  );
}

function getSvgSrc(type: string) {
  switch (type) {
    case 'chzzk':
      return '/chzzk.svg';
    case 'soop':
      return '/soop.svg';
    case 'twitch':
      return '/twitch.svg';
    default:
      throw new Error(`Not supported channel type: ${type}`);
  }
}
