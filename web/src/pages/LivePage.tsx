import { LiveTable } from '@/components/live/LiveTable.tsx';
import { LiveDto } from '@/client/live/live.types.ts';
import { fetchAllLives } from '@/client/live/live.client.ts';
import { useQuery } from '@tanstack/react-query';
import { LIVES_QUERY_KEY } from '@/common/constants.ts';
import { useEffect, useState } from 'react';
import { PageHeaderTab } from '@/components/common/layout/PageHeaderTab.tsx';

export function LivePage() {
  const { data: lives } = useQuery<LiveDto[]>({
    queryKey: [LIVES_QUERY_KEY],
    queryFn: fetchAllLives,
  });
  const [withDisabled, setWithDisabled] = useState(false);
  const [targetLives, setTargetLives] = useState<LiveDto[]>([]);

  useEffect(() => {
    if (!lives) return;
    if (withDisabled) {
      setTargetLives(lives);
    } else {
      setTargetLives(lives.filter((live) => !live.isDisabled));
    }
  }, [lives, withDisabled]);

  return (
    <div>
      <PageHeaderTab live />
      <div className="mx-10 my-3">
        {targetLives && (
          <LiveTable lives={targetLives} withDisabled={withDisabled} setWithDisabled={setWithDisabled} />
        )}
      </div>
    </div>
  );
}
