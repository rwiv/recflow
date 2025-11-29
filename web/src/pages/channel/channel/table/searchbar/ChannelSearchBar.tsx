import { LeftSearchBar } from './left';
import { RightSearchBar } from './right';

export function ChannelSearchBar() {
  return (
    <div className="flex items-center justify-between mb-4">
      <LeftSearchBar />
      <RightSearchBar />
    </div>
  );
}
