import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { TextUpdateForm } from '@/shared/ui/form/TextUpdateForm.tsx';

import { NodeGroupDto } from '@/entities/node/group/model/node-group.schema.ts';

import {
  updateNodeGroupDescription,
  updateNodeGroupName,
} from '@/features/node/group/api/node-group.client.ts';
import { NODE_GROUPS_QUERY_KEY } from '@/features/node/group/config/constants.ts';

type Type = 'name' | 'description';

interface NodeFieldUpdateForm {
  type: Type;
  nodeGroup: NodeGroupDto;
}

const stringSchema = z.coerce.string().nonempty();
const descriptionSchema = z.coerce.string();

export function NodeGroupFieldUpdateForm({ type, nodeGroup }: NodeFieldUpdateForm) {
  const queryClient = useQueryClient();
  const printValue = getPrintValue(type, nodeGroup);
  const defaultValue = getDefaultValue(type, nodeGroup);

  const submit = async (value: string) => {
    try {
      if (type === 'name') {
        await updateNodeGroupName(nodeGroup.id, stringSchema.parse(value));
      } else if (type === 'description') {
        const validated = value === '' ? null : stringSchema.parse(value);
        await updateNodeGroupDescription(nodeGroup.id, validated);
      }
      await queryClient.invalidateQueries({ queryKey: [NODE_GROUPS_QUERY_KEY] });
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

function getDefaultValue(type: Type, nodeGroup: NodeGroupDto): string {
  switch (type) {
    case 'name':
      return nodeGroup.name;
    case 'description':
      return nodeGroup.description ?? '';
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}

function getPrintValue(type: Type, nodeGroup: NodeGroupDto) {
  return getDefaultValue(type, nodeGroup);
}
