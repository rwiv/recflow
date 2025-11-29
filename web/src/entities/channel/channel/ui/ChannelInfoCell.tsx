import { SerializedStyles } from '@emotion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/cn/avatar.tsx';
import { Skeleton } from '@shared/ui/cn/skeleton.tsx';
import { cn } from '@shared/lib/styles/utils.ts';
import { getChannelUrl } from '@shared/lib/platform';
import { ChannelDto } from '@entities/channel/channel';

interface ChannelInfoCellProps {
  channel: ChannelDto;
  className?: string;
  css?: SerializedStyles;
}

export function ChannelInfoCell({ channel, className, css }: ChannelInfoCellProps) {
  return (
    <div className={cn('flex flex-row flex-wrap items-center ml-1', className)} css={css}>
      <a href={getChannelUrl(channel.platform.name, channel.sourceId)}>
        <Avatar className="w-9 h-9">
          <AvatarImage src={channel.profileImgUrl ?? ''} />
          <AvatarFallback>
            <Skeleton className="rounded-full" />
          </AvatarFallback>
        </Avatar>
      </a>
      <div className={cn('center ml-5 mr-1 font-medium', channel.isFollowed ? 'underline' : undefined)}>
        <a href={getChannelUrl(channel.platform.name, channel.sourceId)}>{channel.username}</a>
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
