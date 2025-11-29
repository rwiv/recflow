import { TagBadge } from './TagBadge.tsx';
import { ChannelDto, ChannelInfoCell } from '@entities/channel/channel';
import { TableCell, TableRow } from '@shared/ui/cn/table.tsx';
import { Badge } from '@shared/ui/cn/badge.tsx';
import { prettyDate } from '@shared/lib/types/date.ts';
import { ChannelActions } from './actions';
import { GradeUpdateDialog } from './GradeUpdateDialog.tsx';

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
