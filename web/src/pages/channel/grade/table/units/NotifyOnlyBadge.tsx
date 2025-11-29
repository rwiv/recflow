import { Badge } from '@shared/ui/cn/badge.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { GRADES_QUERY_KEY } from '@shared/config/constants.ts';
import { DefaultAlertDialog } from '@shared/ui/dialog/AlertDialog.tsx';
import { updateGrade } from '@entities/channel/grade/api/grade.client.ts';
import { GradeDto } from '@entities/channel/grade/api/grade.schema.ts';

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
