import { useQuery } from '@tanstack/react-query';
import { GRADES_QUERY_KEY } from '@/common/constants.ts';
import { fetchGrades } from '@/client/channel/grade.client.ts';
import { GradeTable } from '@/components/grade/GradeTable.tsx';
import { PageHeaderTab } from '@/components/common/layout/PageHeaderTab.tsx';
import { GradeDto } from '@/client/channel/grade.schema.ts';

export function GradePage() {
  const { data: nodes } = useQuery<GradeDto[]>({
    queryKey: [GRADES_QUERY_KEY],
    queryFn: fetchGrades,
  });

  return (
    <div>
      <PageHeaderTab grade />
      <div className="mx-10 my-3">{nodes && <GradeTable data={nodes} />}</div>
    </div>
  );
}
