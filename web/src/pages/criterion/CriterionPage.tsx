import { useQuery } from '@tanstack/react-query';
import { CHZZK_CRITERIA_QUERY_KEY, SOOP_CRITERIA_QUERY_KEY } from '@shared/config/constants.ts';
import { fetchChzzkCriteria, fetchSoopCriteria } from '@entities/criterion/api/criterion.client.ts';
import { ChzzkCriterionDto, SoopCriterionDto } from '@entities/criterion/api/criterion.schema.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/cn/tabs.tsx';
import { PageHeaderTab } from '@widgets/header';
import { ChzzkCriterionTable, SoopCriterionTable } from './table';

export function CriterionPage() {
  const { data: chzzkCriteria } = useQuery<ChzzkCriterionDto[]>({
    queryKey: [CHZZK_CRITERIA_QUERY_KEY],
    queryFn: fetchChzzkCriteria,
  });
  const { data: soopCriteria } = useQuery<SoopCriterionDto[]>({
    queryKey: [SOOP_CRITERIA_QUERY_KEY],
    queryFn: fetchSoopCriteria,
  });

  return (
    <div>
      <PageHeaderTab criterion />
      <div className="mx-10 my-3">
        <Tabs defaultValue="chzzk">
          <TabsList>
            <TabsTrigger value="chzzk">Chzzk</TabsTrigger>
            <TabsTrigger value="soop">Soop</TabsTrigger>
          </TabsList>
          <div className="my-5">
            <TabsContent value="chzzk">
              {chzzkCriteria && <ChzzkCriterionTable data={chzzkCriteria} />}
            </TabsContent>
            <TabsContent value="soop">
              {soopCriteria && <SoopCriterionTable data={soopCriteria} />}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
