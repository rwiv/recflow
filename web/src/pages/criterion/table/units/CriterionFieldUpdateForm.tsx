import { TextUpdateForm } from '@shared/ui/form/TextUpdateForm.tsx';
import { CriterionDto } from '@entities/criterion/api/criterion.schema.ts';
import { z } from 'zod';
import { updateCriterion } from '@entities/criterion/api/criterion.client.ts';
import { useQueryClient } from '@tanstack/react-query';
import { CHZZK_CRITERIA_QUERY_KEY, SOOP_CRITERIA_QUERY_KEY } from '@shared/config/constants.ts';

type Type = 'minUserCnt';

interface CriterionFieldUpdateForm {
  type: Type;
  criterion: CriterionDto;
}

const numSchema = z.coerce.number().nonnegative();

export function CriterionFieldUpdateForm({ type, criterion }: CriterionFieldUpdateForm) {
  const queryClient = useQueryClient();
  const value = getValue(type, criterion);

  const submit = async (value: string) => {
    try {
      if (type === 'minUserCnt') {
        await updateCriterion(criterion.id, { minUserCnt: numSchema.parse(value) });
      }
      await queryClient.invalidateQueries({ queryKey: [CHZZK_CRITERIA_QUERY_KEY] });
      await queryClient.invalidateQueries({ queryKey: [SOOP_CRITERIA_QUERY_KEY] });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <TextUpdateForm submit={submit} defaultValue={value} validate={numSchema.parse}>
      <div className="justify-self-center">{value}</div>
    </TextUpdateForm>
  );
}

function getValue(type: Type, criterion: CriterionDto) {
  switch (type) {
    case 'minUserCnt':
      return criterion.minUserCnt.toString();
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}
