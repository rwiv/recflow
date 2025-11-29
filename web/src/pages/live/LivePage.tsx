import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllLives } from '@entities/live/api/live.client.ts';
import { LIVES_QUERY_KEY } from '@shared/config/constants.ts';
import { PageHeaderTab } from '@widgets/header';
import { LiveDto } from '@entities/live/api/live.schema.ts';
import { LiveTable } from './table';

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
