import { TextUpdateForm } from '@/components/common/layout/TextUpdateForm.tsx';
import { CriterionDto } from '@/client/criterion/criterion.schema.ts';
import { z } from 'zod';
import { updateCriterion } from '@/client/criterion/criterion.client.ts';
import { useQueryClient } from '@tanstack/react-query';
import { CHZZK_CRITERIA_QUERY_KEY, SOOP_CRITERIA_QUERY_KEY } from '@/common/constants.ts';

type Type = 'sufficientUserCnt' | 'minUserCnt' | 'minFollowCnt' | 'qualifyingUserCnt' | 'qualifyingFollowCnt';

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
      if (type === 'sufficientUserCnt') {
        await updateCriterion(criterion.id, { sufficientUserCnt: numSchema.parse(value) });
      } else if (type === 'minUserCnt') {
        await updateCriterion(criterion.id, { minUserCnt: numSchema.parse(value) });
      } else if (type === 'minFollowCnt') {
        await updateCriterion(criterion.id, { minFollowCnt: numSchema.parse(value) });
      } else if (type === 'qualifyingUserCnt') {
        await updateCriterion(criterion.id, { qualifyingUserCnt: numSchema.parse(value) });
      } else if (type === 'qualifyingFollowCnt') {
        await updateCriterion(criterion.id, { qualifyingFollowCnt: numSchema.parse(value) });
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
    case 'sufficientUserCnt':
      return criterion.sufficientUserCnt.toString();
    case 'minUserCnt':
      return criterion.minUserCnt.toString();
    case 'minFollowCnt':
      return criterion.minFollowCnt.toString();
    case 'qualifyingUserCnt':
      return criterion.qualifyingUserCnt.toString();
    case 'qualifyingFollowCnt':
      return criterion.qualifyingFollowCnt.toString();
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}
