import { TabButton, TabList } from '@/components/common/layout/Tab.tsx';
import { Link } from 'react-router';
import { ChannelPageState } from '@/hooks/channel/ChannelPageState.ts';

interface HeaderTabProps {
  channelUrl?: string;
  live?: boolean;
  channel?: boolean;
  tag?: boolean;
  grade?: boolean;
  node?: boolean;
  nodeGroup?: boolean;
  criterion?: boolean;
}

export function PageHeaderTab(props: HeaderTabProps) {
  const channelUrl = props.channelUrl ?? `/channels?${ChannelPageState.default().toQueryString()}`;
  return (
    <div className="mx-10 my-3 space-x-2">
      <TabList className="my-3">
        <PageTabButton isActive={props.live ?? false} to={'/'} content={'Lives'} />
        <PageTabButton isActive={props.node ?? false} to={'/nodes'} content={'Nodes'} />
        <PageTabButton isActive={props.nodeGroup ?? false} to={'/node-groups'} content={'Groups'} />
        <PageTabButton isActive={props.criterion ?? false} to={'/criteria'} content={'Criteria'} />
      </TabList>
      <TabList className="my-3">
        <PageTabButton isActive={props.channel ?? false} to={channelUrl} content={'Channels'} />
        <PageTabButton isActive={props.grade ?? false} to={'/grades'} content={'Grades'} />
        <PageTabButton isActive={props.tag ?? false} to={'/tags'} content={'Tags'} />
      </TabList>
    </div>
  );
}

interface PageTabButtonProps {
  isActive: boolean;
  to: string;
  content: string;
}

function PageTabButton({ isActive, to, content }: PageTabButtonProps) {
  return isActive ? (
    <TabButton active>{content}</TabButton>
  ) : (
    <TabButton>
      <Link to={to}>{content}</Link>
    </TabButton>
  );
}
