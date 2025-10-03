import { TableCell, TableRow } from '@/components/ui/table.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { prettyDate } from '@/lib/date.ts';
import { ChannelActions } from '@/components/channel/edit/ChannelActions.tsx';
import { TagBadge } from '@/components/channel/content/TagBadge.tsx';
import { ChannelDto } from '@/client/channel/channel.types.ts';
import { GradeUpdateDialog } from '@/components/channel/edit/GradeUpdateDialog.tsx';
import { ChannelInfoCell } from '@/components/channel/content/ChannelInfoCell.tsx';

export function ChannelRow({ channel }: { channel: ChannelDto }) {
  return (
    <TableRow>
      <TableCell>
        <ChannelInfoCell channel={channel} />
      </TableCell>
      <TableCell>
        <GradeUpdateDialog channel={channel}>
          <button className="uppercase">
            <Badge variant="default">{channel.grade.name}</Badge>
          </button>
        </GradeUpdateDialog>
      </TableCell>
      <TableCell>
        <div className="flex flex-row flex-wrap items-center gap-1.5">
          {channel.tags?.map((tag) => <TagBadge key={tag.id} tag={tag} channel={channel} />)}
        </div>
      </TableCell>
      <TableCell>
        <div className="mr-4">{channel.description}</div>
      </TableCell>
      <TableCell>
        <div className="justify-self-center">{channel.followerCnt}</div>
      </TableCell>
      <TableCell>
        <div className="justify-self-center">{prettyDate(new Date(channel.updatedAt))}</div>
      </TableCell>
      <TableCell>
        <div className="justify-self-center">{prettyDate(new Date(channel.createdAt))}</div>
      </TableCell>
      <TableCell>
        <div className="justify-self-end mr-8">
          <ChannelActions channel={channel} />
        </div>
      </TableCell>
    </TableRow>
  );
}
