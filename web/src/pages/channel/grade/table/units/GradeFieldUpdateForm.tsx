import { TextUpdateForm } from '@shared/ui/form/TextUpdateForm.tsx';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { GradeDto, updateGrade, GRADES_QUERY_KEY } from '@entities/channel/grade';

type Type = 'name' | 'description' | 'tier' | 'seq';

interface NodeFieldUpdateForm {
  type: Type;
  grade: GradeDto;
}

const stringSchema = z.coerce.string().nonempty();
const descriptionSchema = z.coerce.string();
const numSchema = z.coerce.number().nonnegative();

export function GradeFieldUpdateForm({ type, grade }: NodeFieldUpdateForm) {
  const queryClient = useQueryClient();
  const printValue = getPrintValue(type, grade);
  const defaultValue = getDefaultValue(type, grade);

  const submit = async (value: string) => {
    try {
      if (type === 'name') {
        await updateGrade(grade.id, { name: stringSchema.parse(value) });
      } else if (type === 'description') {
        const validated = value === '' ? null : stringSchema.parse(value);
        await updateGrade(grade.id, { description: validated });
      } else if (type == 'tier') {
        await updateGrade(grade.id, { tier: numSchema.parse(value) });
      } else if (type === 'seq') {
        await updateGrade(grade.id, { seq: numSchema.parse(value) });
      }
      await queryClient.invalidateQueries({ queryKey: [GRADES_QUERY_KEY] });
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

function getDefaultValue(type: Type, grade: GradeDto): string {
  switch (type) {
    case 'name':
      return grade.name;
    case 'description':
      return grade.description ?? '';
    case 'tier':
      return grade.tier.toString();
    case 'seq':
      return grade.seq.toString();
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}

function getPrintValue(type: Type, grade: GradeDto) {
  return getDefaultValue(type, grade);
}
