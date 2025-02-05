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
import { Dispatch, KeyboardEventHandler, SetStateAction, useState } from 'react';
import { checkType } from '@/lib/union.ts';
import { useNavigate } from 'react-router';

type Criteria = 'pid' | 'username';

export function KeywordSearchBar() {
  const navigate = useNavigate();
  const [criteria, setCriteria] = useState<Criteria>('username');
  const [input, setInput] = useState('');

  const onKeydown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (ev.key !== 'Enter' || input === '') return;
    setInput('');
    if (criteria === 'username') {
      navigate(`/channels?uname=${input}`);
    } else if (criteria === 'pid') {
      navigate(`/channels?pid=${input}`);
    } else {
      throw new Error(`Invalid criteria: ${criteria}`);
    }
  };

  return (
    <div className="flex gap-2">
      <SearchCriteriaSelect criteria={criteria} setCriteria={setCriteria} />
      <Input
        css={css({ width: '22rem' })}
        value={input}
        onInput={(ev) => setInput(ev.currentTarget.value)}
        onKeyDown={onKeydown}
      />
    </div>
  );
}

interface SearchCriteriaSelectProps {
  criteria: Criteria;
  setCriteria: Dispatch<SetStateAction<Criteria>>;
}

export function SearchCriteriaSelect({ criteria, setCriteria }: SearchCriteriaSelectProps) {
  const onValueChange = (value: string) => {
    const selected = checkType(value, ['pid', 'username'] as const);
    if (selected) {
      setCriteria(selected);
    }
  };

  return (
    <Select defaultValue={criteria} onValueChange={onValueChange}>
      <SelectTrigger css={css({ width: '9rem' })}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="username">Username</SelectItem>
          <SelectItem value="pid">UserID</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
