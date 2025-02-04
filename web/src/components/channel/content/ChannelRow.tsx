import { TableCell, TableRow } from '@/components/ui/table.tsx';
import { getChannelUrl } from '@/lib/platform.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { prettyDate } from '@/lib/date.ts';
import { ChannelActions } from '@/components/channel/edit/ChannelActions.tsx';
import { TagBadge } from '@/components/channel/content/TagBadge.tsx';
import { ChannelRecord } from '@/client/types.channel.ts';

export function ChannelRow({ channel }: { channel: ChannelRecord }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-row flex-wrap items-center ml-1">
          <a href={getChannelUrl(channel.ptype, channel.pid)}>
            <Avatar className="w-9 h-9">
              <AvatarImage src={channel.profileImgUrl ?? ''} />
              <AvatarFallback>None</AvatarFallback>
            </Avatar>
          </a>
          <div className="center ml-5 mr-1 font-medium">
            <a href={getChannelUrl(channel.ptype, channel.pid)}>{channel.username}</a>
          </div>
          <div>
            <img src={getSvgSrc(channel.ptype)} alt="platform type" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="default">
          <button className="uppercase">{channel.priority}</button>
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-row flex-wrap items-center gap-1.5">
          {channel.tags?.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
        </div>
      </TableCell>
      <TableCell>
        <div className="mr-4">{channel.description}</div>
      </TableCell>
      <TableCell>
        <div className="justify-self-end mr-5">{channel.followerCnt}</div>
      </TableCell>
      <TableCell>
        <div className="justify-self-end mr-5">{prettyDate(new Date(channel.updatedAt))}</div>
      </TableCell>
      <TableCell>
        <div className="justify-self-end mr-8">
          <ChannelActions />
        </div>
      </TableCell>
    </TableRow>
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
