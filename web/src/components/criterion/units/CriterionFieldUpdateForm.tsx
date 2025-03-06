import { TextUpdateForm } from '@/components/common/layout/TextUpdateForm.tsx';
import { CriterionDto } from '@/client/criterion/criterion.schema.ts';
import { z } from 'zod';
import {
  updateCriterionMinFollowCnt,
  updateCriterionMinUserCnt,
} from '@/client/criterion/criterion.client.ts';
import { useQueryClient } from '@tanstack/react-query';
import { CHZZK_CRITERIA_QUERY_KEY, SOOP_CRITERIA_QUERY_KEY } from '@/common/constants.ts';

type Type = 'minUserCnt' | 'minFollowCnt';

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
        await updateCriterionMinUserCnt(criterion.id, numSchema.parse(value));
      } else if (type === 'minFollowCnt') {
        await updateCriterionMinFollowCnt(criterion.id, numSchema.parse(value));
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
    case 'minFollowCnt':
      return criterion.minFollowCnt.toString();
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}
