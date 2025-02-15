import { Button } from '@/components/ui/button.tsx';

export function FormSubmitButton() {
  return (
    <div className="flex flex-row justify-end mt-5">
      <Button type="submit" className="px-7">
        Save
      </Button>
    </div>
  );
}
