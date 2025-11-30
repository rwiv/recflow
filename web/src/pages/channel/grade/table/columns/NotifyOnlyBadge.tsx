import { GradeDto } from '@entities/channel/grade/api/grade.schema.ts';
import { Badge } from '@shared/ui/cn/badge.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { updateGrade } from '@entities/channel/grade/api/grade.client.ts';
import { GRADES_QUERY_KEY } from '@pages/channel/grade/config/constants.ts';
import { DefaultAlertDialog } from '@shared/ui/dialog/AlertDialog.tsx';

export function NotifyOnlyBadge({ grade }: { grade: GradeDto }) {
  const queryClient = useQueryClient();
  const content = grade.shouldNotify ? 'ON' : 'OFF';

  const onClick = async () => {
    await updateGrade(grade.id, { shouldNotify: !grade.shouldNotify });
    await queryClient.invalidateQueries({ queryKey: [GRADES_QUERY_KEY] });
  };

  return (
    <DefaultAlertDialog onAction={onClick}>
      <div className="justify-self-center">
        <button className="uppercase">
          <Badge variant={grade.shouldNotify ? 'default' : 'outline'}>{content}</Badge>
        </button>
      </div>
    </DefaultAlertDialog>
  );
}
