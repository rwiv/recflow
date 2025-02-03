import { UseFormReturn } from 'react-hook-form';

export interface BaseEditFormProps {
  type: 'chzzk' | 'soop';
  uid: string;
}

export type EditForm = UseFormReturn<BaseEditFormProps>;
