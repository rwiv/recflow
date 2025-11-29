import { ChannelCreateButton } from './createButton';
import { KeywordSearchBar } from './KeywordSearchBar.tsx';

export function LeftSearchBar() {
  return (
    <div className="flex">
      <KeywordSearchBar />
      <div className="flex ml-2 gap-1">
        <ChannelCreateButton />
      </div>
    </div>
  );
}
