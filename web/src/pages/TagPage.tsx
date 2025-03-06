import { useQuery } from '@tanstack/react-query';
import { TAGS_QUERY_KEY } from '@/common/constants.ts';
import { PageHeaderTab } from '@/components/common/layout/PageHeaderTab.tsx';
import { TagDto } from '@/client/channel/tag.schema.ts';
import { fetchTags } from '@/client/channel/tag.client.ts';
import { TagTable } from '@/components/tag/TagTable.tsx';

export function TagPage() {
  const { data: nodes } = useQuery<TagDto[]>({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: fetchTags,
  });

  return (
    <div>
      <PageHeaderTab tag />
      <div className="mx-10 my-3">{nodes && <TagTable data={nodes} />}</div>
    </div>
  );
}
