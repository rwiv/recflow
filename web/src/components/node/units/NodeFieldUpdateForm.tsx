import { TextUpdateForm } from '@/components/common/layout/TextUpdateForm.tsx';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NODES_QUERY_KEY, PLATFORMS_QUERY_KEY } from '@/common/constants.ts';
import { NodeDto } from '@/client/node/node.schema.ts';
import {
  updateNodeCapacity,
  updateNodeEndpoint,
  updateNodeName,
  updateNodeTotalCapacity,
  updateNodeWeight,
} from '@/client/node/node.client.ts';
import { fetchPlatforms } from '@/client/common/platform.client.ts';
import { PlatformDto } from '@/client/common/platform.schema.ts';

type Type = 'name' | 'endpoint' | 'weight' | 'totalCapacity' | 'chzzkCapacity' | 'soopCapacity';

interface NodeFieldUpdateForm {
  type: Type;
  node: NodeDto;
}

const stringSchema = z.string().nonempty();
const numSchema = z.coerce.number().nonnegative();
const endpointSize = 30;

export function NodeFieldUpdateForm({ type, node }: NodeFieldUpdateForm) {
  const queryClient = useQueryClient();
  const printValue = getPrintValue(type, node);
  const defaultValue = getDefaultValue(type, node);

  const { data: platforms } = useQuery({
    queryKey: [PLATFORMS_QUERY_KEY],
    queryFn: fetchPlatforms,
  });

  const submit = async (value: string) => {
    try {
      if (type === 'name') {
        await updateNodeName(node.id, stringSchema.parse(value));
      } else if (type === 'endpoint') {
        await updateNodeEndpoint(node.id, stringSchema.parse(value));
      } else if (type === 'weight') {
        await updateNodeWeight(node.id, numSchema.parse(value));
      } else if (type === 'totalCapacity') {
        await updateNodeTotalCapacity(node.id, numSchema.parse(value));
      } else if (type === 'chzzkCapacity') {
        const platform = findPlatform('chzzk', platforms);
        await updateNodeCapacity(node.id, { platformId: platform.id, capacity: numSchema.parse(value) });
      } else if (type === 'soopCapacity') {
        const platform = findPlatform('soop', platforms);
        await updateNodeCapacity(node.id, { platformId: platform.id, capacity: numSchema.parse(value) });
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
    case 'weight':
    case 'totalCapacity':
    case 'chzzkCapacity':
    case 'soopCapacity':
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
    case 'weight':
      return node.weight.toString();
    case 'totalCapacity':
      return node.totalCapacity.toString();
    case 'chzzkCapacity': {
      return findState('chzzk', node).capacity.toString();
    }
    case 'soopCapacity': {
      return findState('soop', node).capacity.toString();
    }
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
    case 'chzzkCapacity': {
      const state = findState('chzzk', node);
      return `${state.assigned} (${state.capacity})`;
    }
    case 'soopCapacity': {
      const state = findState('soop', node);
      return `${state.assigned} (${state.capacity})`;
    }
    default:
      return getDefaultValue(type, node);
  }
}

function findState(platformName: string, node: NodeDto) {
  const state = node.states?.find((state) => state.platform.name === platformName);
  if (!state) throw new Error(`Not found state: platformName=${platformName}`);
  return state;
}

function findPlatform(platformName: string, platforms?: PlatformDto[]) {
  const platform = platforms?.find((platform) => platform.name === platformName);
  if (!platform) throw new Error(`Not found platform: platformName=${platformName}`);
  return platform;
}
