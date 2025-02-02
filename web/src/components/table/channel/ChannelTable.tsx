import { ChannelRecord } from '@/client/types.ts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { getChannelUrl } from '@/lib/platform.ts';
import { prettyDate } from '@/lib/date.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { css } from '@emotion/react';
import { Button } from '@/components/ui/button.tsx';
import { CopyPlus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { IconButton } from '@/components/common/IconButton.tsx';

export function ChannelTable({ channels }: { channels: ChannelRecord[] }) {
  return (
    <div>
      <div className="rounded-md border">
        <ChannelTableContent channels={channels} />
      </div>
      <div className="flex justify-between space-x-2 py-4">
        <div className="flex flex-row space-x-2">
          <SearchBtn />
          <Separator orientation="vertical" />
          <AddBtn />
        </div>
        <PageNavigation />
      </div>
    </div>
  );
}

function AddBtn() {
  return (
    <IconButton className="w-10">
      <CopyPlus size="1.1rem" />
    </IconButton>
  );
}

function SearchBtn() {
  return (
    <div className="flex flex-row">
      <Input className="max-w-sm mr-1.5" />
      <IconButton className="w-10">
        <Search size="1.1rem" />
      </IconButton>
    </div>
  );
}

function PageNavigation() {
  return (
    <div className="space-x-2">
      <Button variant="outline">Previous</Button>
      <Button variant="outline">Next</Button>
    </div>
  );
}

export function ChannelTableContent({ channels }: { channels: ChannelRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead css={css({ width: '20rem' })}>
            <div className="ml-2">Channel</div>
          </TableHead>
          <TableHead css={css({ width: '7rem' })}>Priority</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead css={css({ width: '8rem' })}>
            <div className="justify-self-end">Followers</div>
          </TableHead>
          <TableHead css={css({ width: '12em' })}>
            <div className="justify-self-end mr-10">Date</div>
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
        <div className="flex flex-row items-center ml-1">
          <a href={getChannelUrl(channel.ptype, channel.pid)}>
            <Avatar className="w-9 h-9">
              <AvatarImage src={channel.profileImgUrl ?? ''} />
              <AvatarFallback>CN</AvatarFallback>
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
        <Badge className="uppercase cursor-default" variant="default">
          {channel.priority}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-row gap-1.5">
          {channel.tags?.map((tag) => (
            <button>
              <Badge variant="secondary">{tag.name}</Badge>
            </button>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className="justify-self-end mr-4">{channel.followerCount}</div>
      </TableCell>
      <TableCell>
        <div className="justify-self-end mr-5">{prettyDate(channel.updatedAt)}</div>
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
