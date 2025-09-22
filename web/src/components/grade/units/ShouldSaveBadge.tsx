import { Badge } from '@/components/ui/badge.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { GRADES_QUERY_KEY } from '@/common/constants.ts';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';
import { updateGrade } from '@/client/channel/grade.client.ts';
import { GradeDto } from '@/client/channel/grade.schema.ts';
import { switchBadgeCn1 } from '@/components/common/styles/common.ts';

export function ShouldSaveBadge({ grade }: { grade: GradeDto }) {
  const queryClient = useQueryClient();
  const content = grade.shouldSave ? 'ON' : 'OFF';

  const onClick = async () => {
    await updateGrade(grade.id, { shouldSave: !grade.shouldSave });
    await queryClient.invalidateQueries({ queryKey: [GRADES_QUERY_KEY] });
  };

  return (
    <DefaultAlertDialog onAction={onClick}>
      <div className="justify-self-center">
        <button className="uppercase">
          <Badge className={switchBadgeCn1(grade.shouldSave)}>{content}</Badge>
        </button>
      </div>
    </DefaultAlertDialog>
  );
}
