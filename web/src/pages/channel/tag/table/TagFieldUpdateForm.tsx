import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { TagDto } from '@entities/channel/tag/api/tag.schema';
import { updateTagDescription, updateTagName } from '@entities/channel/tag/api/tag.client.ts';
import { TAGS_QUERY_KEY } from '@pages/channel/tag/config/constants.ts';
import { TextUpdateForm } from '@shared/ui/form/TextUpdateForm';

type Type = 'name' | 'description';

interface NodeFieldUpdateForm {
  type: Type;
  tag: TagDto;
}

const stringSchema = z.coerce.string().nonempty();
const descriptionSchema = z.coerce.string();

export function TagFieldUpdateForm({ type, tag }: NodeFieldUpdateForm) {
  const queryClient = useQueryClient();
  const printValue = getPrintValue(type, tag);
  const defaultValue = getDefaultValue(type, tag);

  const submit = async (value: string) => {
    try {
      if (type === 'name') {
        await updateTagName(tag.id, stringSchema.parse(value));
      } else if (type === 'description') {
        const validated = value === '' ? null : stringSchema.parse(value);
        await updateTagDescription(tag.id, validated);
      }
      await queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
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
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}

function getDefaultValue(type: Type, tag: TagDto): string {
  switch (type) {
    case 'name':
      return tag.name;
    case 'description':
      return tag.description ?? '';
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}

function getPrintValue(type: Type, tag: TagDto) {
  return getDefaultValue(type, tag);
}
