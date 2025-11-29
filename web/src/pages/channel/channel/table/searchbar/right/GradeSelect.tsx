import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { css } from '@emotion/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/cn/select.tsx';
import { useChannelPageStore } from '@entities/channel/channel';
import { fetchGrades, GRADES_QUERY_KEY } from '@entities/channel/grade';

export function GradeSelect() {
  const navigate = useNavigate();
  const { pageState } = useChannelPageStore();

  const { data: grades } = useQuery({
    queryKey: [GRADES_QUERY_KEY],
    queryFn: fetchGrades,
  });

  const onChange = async (value: string) => {
    if (!pageState) return;
    const builder = pageState.new();
    if (value === 'all') {
      builder.setGrade(undefined);
    } else {
      builder.setGrade(value);
    }
    navigate(`/channels?${builder.build().toQueryString()}`);
  };

  if (!pageState) {
    return <div>Loading...</div>;
  }

  return (
    <Select defaultValue={pageState.grade ?? 'all'} onValueChange={onChange}>
      <SelectTrigger css={css({ width: '9rem' })}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">ALL Grades</SelectItem>
          {grades?.map((grade) => (
            <SelectItem key={grade.id} value={grade.name}>
              {grade.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
