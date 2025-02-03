import { UseFormReturn } from 'react-hook-form';

export interface EditFormProps {
  type: 'chzzk' | 'soop';
  uid: string;
  tagNames: string[];
}

export type EditForm = UseFormReturn<EditFormProps>;
