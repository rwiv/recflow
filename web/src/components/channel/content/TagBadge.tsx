import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { TagRecord } from '@/client/types.ts';

export function TagBadge({ tag }: { tag: TagRecord }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button key={tag.id}>
          <Badge variant="secondary">{tag.name}</Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Search</DropdownMenuItem>
        <DropdownMenuItem>Details</DropdownMenuItem>
        <DropdownMenuItem>Update</DropdownMenuItem>
        <DropdownMenuItem>Detach</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
