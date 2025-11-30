import { useQuery } from '@tanstack/react-query';

import { GradeDto } from '@/entities/channel/grade/model/grade.schema.ts';

import { fetchGrades } from '@/features/channel/grade/api/grade.client.ts';
import { GRADES_QUERY_KEY } from '@/features/channel/grade/config/constants.ts';

import { PageHeaderTab } from '@/widgets/header/ui/PageHeaderTab.tsx';

import { GradeTable } from '@/pages/channel/grade/ui/table/GradeTable.tsx';

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
