import { TextUpdateForm } from '@/components/common/layout/TextUpdateForm.tsx';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { PRIORITIES_QUERY_KEY } from '@/common/constants.ts';
import {
  updatePriorityDescription,
  updatePriorityName,
  updatePrioritySeq,
  updatePriorityTier,
} from '@/client/channel/priority.client.ts';
import { PriorityDto } from '@/client/channel/priority.schema.ts';

type Type = 'name' | 'description' | 'tier' | 'seq';

interface NodeFieldUpdateForm {
  type: Type;
  priority: PriorityDto;
}

const stringSchema = z.coerce.string().nonempty();
const descriptionSchema = z.coerce.string();
const numSchema = z.coerce.number().nonnegative();

export function PriorityFieldUpdateForm({ type, priority }: NodeFieldUpdateForm) {
  const queryClient = useQueryClient();
  const printValue = getPrintValue(type, priority);
  const defaultValue = getDefaultValue(type, priority);

  const submit = async (value: string) => {
    try {
      if (type === 'name') {
        await updatePriorityName(priority.id, stringSchema.parse(value));
      } else if (type === 'description') {
        const validated = value === '' ? null : stringSchema.parse(value);
        await updatePriorityDescription(priority.id, validated);
      } else if (type === 'tier') {
        await updatePriorityTier(priority.id, numSchema.parse(value));
      } else if (type === 'seq') {
        await updatePrioritySeq(priority.id, numSchema.parse(value));
      }
      await queryClient.invalidateQueries({ queryKey: [PRIORITIES_QUERY_KEY] });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <TextUpdateForm submit={submit} defaultValue={defaultValue} validate={getValidate(type)}>
      <div className="justify-self-center">{printValue}</div>
    </TextUpdateForm>
  );
}

function getValidate(type: Type) {
  switch (type) {
    case 'name':
      return stringSchema.parse;
    case 'description':
      return descriptionSchema.parse;
    case 'tier':
    case 'seq':
      return numSchema.parse;
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}

function getDefaultValue(type: Type, priority: PriorityDto): string {
  switch (type) {
    case 'name':
      return priority.name;
    case 'description':
      return priority.description ?? '';
    case 'tier':
      return priority.tier.toString();
    case 'seq':
      return priority.seq.toString();
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}

function getPrintValue(type: Type, priority: PriorityDto) {
  return getDefaultValue(type, priority);
}
