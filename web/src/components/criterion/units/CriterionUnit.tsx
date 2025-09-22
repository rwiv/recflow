import { deleteCriterionUnit } from '@/client/criterion/criterion.client.ts';
import { CriterionUnitDto } from '@/client/criterion/criterion.schema.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultAlertDialog } from '@/components/common/layout/AlertDialog.tsx';

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
