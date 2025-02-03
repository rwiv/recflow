import { Input } from '@/components/ui/input.tsx';
import { css } from '@emotion/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';

export function KeywordSearchBar() {
  return (
    <div className="flex gap-2">
      <SearchCriteriaSelect />
      <Input css={css({ width: '22rem' })} />
    </div>
  );
}

export function SearchCriteriaSelect() {
  return (
    <Select defaultValue="pid">
      <SelectTrigger css={css({ width: '9rem' })}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="pid">UserID</SelectItem>
          <SelectItem value="username">Username</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
