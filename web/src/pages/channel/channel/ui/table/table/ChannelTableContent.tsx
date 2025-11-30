import { css } from '@emotion/react';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/ui/cn/table.tsx';

import { ChannelDto } from '@/entities/channel/channel/model/channel.schema.ts';

import { ChannelRow } from '@/pages/channel/channel/ui/table/row/ChannelRow.tsx';

export function ChannelTableContent({ channels }: { channels: ChannelDto[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead css={css({ width: '16rem' })}>
            <div className="ml-2">Channel</div>
          </TableHead>
          <TableHead css={css({ width: '9rem' })}>Grade</TableHead>
          <TableHead css={css({ width: '16rem' })}>Tags</TableHead>
          <TableHead>Description</TableHead>
          <TableHead css={css({ width: '8rem' })}>
            <div className="justify-self-center">Followers</div>
          </TableHead>
          <TableHead css={css({ width: '10em' })}>
            <div className="justify-self-center">UpdatedAt</div>
          </TableHead>
          <TableHead css={css({ width: '10em' })}>
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
