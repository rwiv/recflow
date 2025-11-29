import { useQuery } from '@tanstack/react-query';
import { GRADES_QUERY_KEY } from '@shared/config/constants.ts';
import { fetchGrades } from '@entities/channel/grade/api/grade.client.ts';
import { PageHeaderTab } from '@widgets/header';
import { GradeDto } from '@entities/channel/grade/api/grade.schema.ts';
import { GradeTable } from './table';

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
