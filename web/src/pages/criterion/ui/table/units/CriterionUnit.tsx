import { deleteCriterionUnit } from '@/pages/criterion/api/criterion.client.ts';
import { CriterionUnitDto } from '@/pages/criterion/api/criterion.schema.ts';
import { Badge } from '@/shared/ui/cn/badge.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultAlertDialog } from '@/shared/ui/dialog/AlertDialog.tsx';

export function CriterionUnit({ unit, queryKey }: { unit: CriterionUnitDto; queryKey: string }) {
  const queryClient = useQueryClient();

  const onClick = async () => {
    await deleteCriterionUnit(unit.id);
    await queryClient.invalidateQueries({ queryKey: [queryKey] });
  };

  return (
    <DefaultAlertDialog onAction={onClick}>
      <Badge variant="secondary" className="cursor-pointer">
        {unit.value}
      </Badge>
    </DefaultAlertDialog>
  );
}
