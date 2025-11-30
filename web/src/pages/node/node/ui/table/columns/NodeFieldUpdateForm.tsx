import { TextUpdateForm } from '@/shared/ui/form/TextUpdateForm.tsx';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { updateNode } from '@/entities/node/node/api/node.client.ts';
import { NodeDto } from '@/entities/node/node/api/node.schema.ts';
import { NODES_QUERY_KEY } from '@/pages/node/node/config/constants.ts';

type Type = 'name' | 'endpoint' | 'priority' | 'capacity' | 'failureCnt';

interface NodeFieldUpdateForm {
  type: Type;
  node: NodeDto;
}

const stringSchema = z.string().nonempty();
const numSchema = z.coerce.number().nonnegative();
const endpointSize = 40;

export function NodeFieldUpdateForm({ type, node }: NodeFieldUpdateForm) {
  const queryClient = useQueryClient();
  const printValue = getPrintValue(type, node);
  const defaultValue = getDefaultValue(type, node);

  const submit = async (value: string) => {
    try {
      if (type === 'name') {
        await updateNode(node.id, { name: stringSchema.parse(value) });
      } else if (type === 'endpoint') {
        await updateNode(node.id, { endpoint: stringSchema.parse(value) });
      } else if (type === 'priority') {
        await updateNode(node.id, { priority: numSchema.parse(value) });
      } else if (type === 'capacity') {
        await updateNode(node.id, { capacity: numSchema.parse(value) });
      } else if (type === 'failureCnt') {
        await updateNode(node.id, { failureCnt: numSchema.parse(value) });
      }
      await queryClient.invalidateQueries({ queryKey: [NODES_QUERY_KEY] });
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
    case 'endpoint':
      return stringSchema.parse;
    case 'priority':
    case 'capacity':
    case 'failureCnt':
      return numSchema.parse;
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}

function getDefaultValue(type: Type, node: NodeDto) {
  switch (type) {
    case 'name':
      return node.name;
    case 'endpoint':
      return node.endpoint;
    case 'priority':
      return node.priority.toString();
    case 'capacity':
      return node.capacity.toString();
    case 'failureCnt':
      return node.failureCnt.toString();
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}

function getPrintValue(type: Type, node: NodeDto) {
  switch (type) {
    case 'endpoint':
      if (node.endpoint.length > endpointSize) {
        return node.endpoint.slice(0, endpointSize) + '...';
      } else {
        return node.endpoint;
      }
    case 'capacity':
      return `${node.livesCnt} / ${node.capacity}`;
    default:
      return getDefaultValue(type, node);
  }
}
