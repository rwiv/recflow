import { TagSelect } from '@/components/channel/common/TagSelect.tsx';
import { useNavigate } from 'react-router';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { TagRecord } from '@/client/tag.types.ts';

export function TagQuerySelect() {
  const navigate = useNavigate();
  const { pageState } = useChannelPageStore();

  const onSelect = (tag: TagRecord) => {
    if (!pageState) return;
    const newPageState = pageState.new().setTagName(tag.name).build();
    navigate(`/channels?${newPageState.toQueryString()}`);
  };

  return (
    <div>
      <TagSelect onSelectCallback={onSelect} />
    </div>
  );
}
