import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { css } from '@emotion/react';
import { ChannelRow } from '@/components/channel/content/ChannelRow.tsx';
import { ChannelDto } from '@/client/channel/channel.types.ts';

export function ChannelTableContent({ channels }: { channels: ChannelDto[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead css={css({ width: '15rem' })}>
            <div className="ml-2">Channel</div>
          </TableHead>
          <TableHead css={css({ width: '9rem' })}>Grade</TableHead>
          <TableHead css={css({ width: '18rem' })}>Tags</TableHead>
          <TableHead>Description</TableHead>
          <TableHead css={css({ width: '8rem' })}>
            <div className="justify-self-center">Followers</div>
          </TableHead>
          <TableHead css={css({ width: '11em' })}>
            <div className="justify-self-center">UpdatedAt</div>
          </TableHead>
          <TableHead css={css({ width: '11em' })}>
            <div className="justify-self-center">CreatedAt</div>
          </TableHead>
          <TableHead css={css({ width: '8em' })}>
            <div className="justify-self-end mr-6">Actions</div>
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
