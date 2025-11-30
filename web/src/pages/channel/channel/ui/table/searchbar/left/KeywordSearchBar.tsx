import { useNavigate } from 'react-router';
import { css } from '@emotion/react';
import { Search } from 'lucide-react';
import { Input } from '@/shared/ui/cn/input.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/cn/select.tsx';
import { Dispatch, KeyboardEventHandler, SetStateAction, useState } from 'react';
import { checkType } from '@/shared/lib/types/union.ts';
import { Button } from '@/shared/ui/cn/button.tsx';

type Criteria = 'sourceId' | 'username';

export function KeywordSearchBar() {
  const navigate = useNavigate();
  const [criteria, setCriteria] = useState<Criteria>('username');
  const [input, setInput] = useState('');

  const onKeydown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (ev.key !== 'Enter' || input === '') return;
    submit();
  };

  const submit = () => {
    setInput('');
    if (criteria === 'username') {
      navigate(`/channels?uname=${input}`);
    } else if (criteria === 'sourceId') {
      navigate(`/channels?uid=${input}`);
    } else {
      throw new Error(`Invalid criteria: ${criteria}`);
    }
  };

  return (
    <div className="flex gap-1.5">
      <SearchCriteriaSelect criteria={criteria} setCriteria={setCriteria} />
      <Input
        css={css({ width: '19rem' })}
        value={input}
        onInput={(ev) => setInput(ev.currentTarget.value)}
        onKeyDown={onKeydown}
      />
      <Button variant="ghost" size="icon" onClick={submit}>
        <Search />
      </Button>
    </div>
  );
}

interface SearchCriteriaSelectProps {
  criteria: Criteria;
  setCriteria: Dispatch<SetStateAction<Criteria>>;
}

export function SearchCriteriaSelect({ criteria, setCriteria }: SearchCriteriaSelectProps) {
  const onValueChange = (value: string) => {
    const selected = checkType(value, ['sourceId', 'username'] as const);
    if (selected) {
      setCriteria(selected);
    }
  };

  return (
    <Select defaultValue={criteria} onValueChange={onValueChange}>
      <SelectTrigger css={css({ width: '8rem' })}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="username">Username</SelectItem>
          <SelectItem value="sourceId">UserID</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
