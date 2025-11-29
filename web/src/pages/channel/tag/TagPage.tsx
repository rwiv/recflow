import { useQuery } from '@tanstack/react-query';
import { PageHeaderTab } from '@widgets/header';
import { TagDto, fetchTags, TAGS_QUERY_KEY } from '@entities/channel/tag';
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
