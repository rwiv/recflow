import { TextUpdateForm } from '@/components/common/layout/TextUpdateForm.tsx';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { NODE_GROUPS_QUERY_KEY } from '@/common/constants.ts';
import {
  updateNodeGroupDescription,
  updateNodeGroupName,
  updateNodeGroupTier,
} from '@/client/node/node-group.client.ts';
import { NodeGroupDto } from '@/client/node/node.schema.ts';

type Type = 'name' | 'description' | 'tier';

interface NodeFieldUpdateForm {
  type: Type;
  nodeGroup: NodeGroupDto;
}

const stringSchema = z.coerce.string().nonempty();
const descriptionSchema = z.coerce.string();
const numSchema = z.coerce.number().nonnegative();

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
      } else if (type === 'tier') {
        await updateNodeGroupTier(nodeGroup.id, numSchema.parse(value));
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
    case 'tier':
      return numSchema.parse;
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
    case 'tier':
      return nodeGroup.tier.toString();
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}

function getPrintValue(type: Type, nodeGroup: NodeGroupDto) {
  return getDefaultValue(type, nodeGroup);
}
