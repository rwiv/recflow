import { TableCell, TableRow } from '@shared/ui/cn/table.tsx';
import { Badge } from '@shared/ui/cn/badge.tsx';
import { prettyDate } from '@shared/lib/types/date.ts';
import { ChannelDto } from '@entities/channel/channel/api/channel.types.ts';
import { GradeUpdateDialog } from '@pages/channel/channel/ui/table/row/GradeUpdateDialog.tsx';
import { ChannelInfoCell } from '@entities/channel/channel/ui/ChannelInfoCell.tsx';
import { ChannelActions } from '@pages/channel/channel/ui/table/row/actions/ChannelActions.tsx';
import { TagBadge } from '@pages/channel/channel/ui/table/row/TagBadge.tsx';

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
