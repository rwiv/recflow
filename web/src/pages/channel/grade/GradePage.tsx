import { useQuery } from '@tanstack/react-query';
import { PageHeaderTab } from '@widgets/header';
import { GradeDto, fetchGrades, GRADES_QUERY_KEY } from '@entities/channel/grade';
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
