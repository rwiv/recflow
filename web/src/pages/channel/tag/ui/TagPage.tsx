import { useQuery } from '@tanstack/react-query';
import { TagDto } from '@entities/channel/tag/api/tag.schema.ts';
import { TAGS_QUERY_KEY } from '@pages/channel/tag/config/constants.ts';
import { fetchTags } from '@entities/channel/tag/api/tag.client.ts';
import { TagTable } from '@pages/channel/tag/ui/table/TagTable.tsx';
import { PageHeaderTab } from '@widgets/header/ui/PageHeaderTab.tsx';

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
