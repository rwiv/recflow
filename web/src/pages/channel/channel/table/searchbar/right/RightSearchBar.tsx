import { GradeSelect } from './GradeSelect.tsx';
import { PlatformSelect } from './PlatformSelect.tsx';
import { TagQuerySelect } from './TagQuerySelect.tsx';
import { SortSelect } from './SortSelect.tsx';

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
