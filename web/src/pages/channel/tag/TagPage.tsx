import { useQuery } from '@tanstack/react-query';
import { TAGS_QUERY_KEY } from '@shared/config/constants.ts';
import { PageHeaderTab } from '@widgets/header';
import { TagDto } from '@entities/channel/tag/api/tag.schema.ts';
import { fetchTags } from '@entities/channel/tag/api/tag.client.ts';
import { TagTable } from './table';

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
