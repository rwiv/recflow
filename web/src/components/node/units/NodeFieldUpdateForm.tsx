import { TextUpdateForm } from '@/components/common/layout/TextUpdateForm.tsx';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NODES_QUERY_KEY, PLATFORMS_QUERY_KEY } from '@/common/constants.ts';
import { NodeDto } from '@/client/node.schema.ts';
import { updateNodeCapacity, updateNodeTotalCapacity, updateNodeWeight } from '@/client/node.client.ts';
import { fetchPlatforms } from '@/client/platform.client.ts';
import { PlatformDto } from '@/client/common.schema.ts';

type Type = 'weight' | 'totalCapacity' | 'chzzkCapacity' | 'soopCapacity';

interface NodeFieldUpdateForm {
  type: Type;
  node: NodeDto;
}

const numSchema = z.coerce.number().nonnegative();

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
      if (type === 'weight') {
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
    <TextUpdateForm submit={submit} defaultValue={defaultValue} validate={numSchema.parse}>
      <div className="justify-self-center">{printValue}</div>
    </TextUpdateForm>
  );
}

function getDefaultValue(type: Type, node: NodeDto) {
  switch (type) {
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
