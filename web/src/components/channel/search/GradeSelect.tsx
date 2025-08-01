import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { css } from '@emotion/react';
import { useChannelPageStore } from '@/hooks/channel/useChannelPageStore.ts';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { GRADES_QUERY_KEY } from '@/common/constants.ts';
import { fetchGrades } from '@/client/channel/grade.client.ts';

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
