import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SCHEDULE_QUERY_KEY } from '@/common/constants.ts';
import { isScheduled, startSchedule, stopSchedule } from '@/client/live.client.ts';
import { Button } from '@/components/ui/button.tsx';

export function ScheduleButton() {
  const queryClient = useQueryClient();
  const { data: scheduleStatus } = useQuery({
    queryKey: [SCHEDULE_QUERY_KEY],
    queryFn: isScheduled,
  });

  const start = async () => {
    await startSchedule();
    await queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEY] });
  };

  const stop = async () => {
    await stopSchedule();
    await queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEY] });
  };

  if (!scheduleStatus) {
    return 'error';
  }

  if (scheduleStatus.status) {
    return (
      <Button variant="outline" onClick={stop}>
        Stop
      </Button>
    );
  } else {
    return (
      <Button variant="outline" onClick={start}>
        Start
      </Button>
    );
  }
}
