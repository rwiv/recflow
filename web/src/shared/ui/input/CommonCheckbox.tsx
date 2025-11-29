import { Checkbox } from '@shared/ui/cn/checkbox.tsx';
import { cn } from '@shared/lib/styles/utils.ts';
import { CheckedState } from '@radix-ui/react-checkbox';

interface CommonCheckboxProps {
  checkBoxId: string;
  labelContent: string;
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: CheckedState) => void;
}

export function CommonCheckbox({
  checkBoxId,
  className,
  labelContent,
  checked,
  onCheckedChange,
}: CommonCheckboxProps) {
  return (
    <div className={cn('flex space-x-2 items-center', className)}>
      <Checkbox id={checkBoxId} checked={checked} onCheckedChange={onCheckedChange} />
      <label
        htmlFor={checkBoxId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {labelContent}
      </label>
    </div>
  );
}
