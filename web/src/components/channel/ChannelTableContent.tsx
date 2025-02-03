import { ChannelRecord } from '@/client/types.ts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';
import { css } from '@emotion/react';
import { getChannelUrl } from '@/lib/platform.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { prettyDate } from '@/lib/date.ts';
import { UserPen } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';

export function ChannelTableContent({ channels }: { channels: ChannelRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead css={css({ width: '15rem' })}>
            <div className="ml-2">Channel</div>
          </TableHead>
          <TableHead css={css({ width: '7rem' })}>Priority</TableHead>
          <TableHead css={css({ width: '20rem' })}>Tags</TableHead>
          <TableHead>Description</TableHead>
          <TableHead css={css({ width: '8rem' })}>
            <div className="justify-self-end">Followers</div>
          </TableHead>
          <TableHead css={css({ width: '12em' })}>
            <div className="justify-self-end mr-6">Date</div>
          </TableHead>
          <TableHead css={css({ width: '7em' })}>
            <div className="justify-self-end mr-6">Edit</div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {channels.map((channel) => (
          <ChannelRow key={channel.id} channel={channel} />
        ))}
      </TableBody>
    </Table>
  );
}

function ChannelRow({ channel }: { channel: ChannelRecord }) {
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
            <button>{channel.username}</button>
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
        <div className="flex flex-row flex-wrap gap-1.5">
          {channel.tags?.map((tag) => (
            <button key={tag.id}>
              <Badge variant="secondary">{tag.name}</Badge>
            </button>
          ))}
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
        <div className="justify-self-end mr-5">
          <Button variant="ghost" size="icon">
            <UserPen />
          </Button>
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
