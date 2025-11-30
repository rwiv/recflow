import { GradeSelect } from '@pages/channel/channel/ui/table/searchbar/right/GradeSelect.tsx';
import { PlatformSelect } from '@pages/channel/channel/ui/table/searchbar/right/PlatformSelect.tsx';
import { TagQuerySelect } from '@pages/channel/channel/ui/table/searchbar/right/TagQuerySelect.tsx';
import { SortSelect } from '@pages/channel/channel/ui/table/searchbar/right/SortSelect.tsx';

export function RightSearchBar() {
  return (
    <div className="flex gap-2">
      <GradeSelect />
      <PlatformSelect />
      <TagQuerySelect type="include" />
      <TagQuerySelect type="exclude" />
      <SortSelect />
    </div>
  );
}
