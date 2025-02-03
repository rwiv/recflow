import { IconButton } from '@/components/common/IconButton.tsx';
import { CopyPlus } from 'lucide-react';

export function ChannelAddButton() {
  return (
    <IconButton className="w-10">
      <CopyPlus size="1.1rem" />
    </IconButton>
  );
}
