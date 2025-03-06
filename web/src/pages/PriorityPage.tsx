import { useQuery } from '@tanstack/react-query';
import { PRIORITIES_QUERY_KEY } from '@/common/constants.ts';
import { fetchPriorities } from '@/client/channel/priority.client.ts';
import { PriorityTable } from '@/components/priority/PriorityTable.tsx';
import { PageHeaderTab } from '@/components/common/layout/PageHeaderTab.tsx';
import { PriorityDto } from '@/client/channel/priority.schema.ts';

export function PriorityPage() {
  const { data: nodes } = useQuery<PriorityDto[]>({
    queryKey: [PRIORITIES_QUERY_KEY],
    queryFn: fetchPriorities,
  });

  return (
    <div>
      <PageHeaderTab priority />
      <div className="mx-10 my-3">{nodes && <PriorityTable data={nodes} />}</div>
    </div>
  );
}
