import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/shared/ui/cn/form.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { createLive } from '@/pages/live/api/live.client.ts';
import { useRef } from 'react';
import { SelectItem } from '@/shared/ui/cn/select.tsx';
import { platformNameEnum } from '@/entities/platform/api/platform.schema.ts';
import { SelectFormField } from '@/shared/ui/form/SelectFormField.tsx';
import { TextFormField } from '@/shared/ui/form/TextFormField.tsx';
import { DialogButton } from '@/shared/ui/dialog/DialogButton.tsx';
import { FormSubmitButton } from '@/shared/ui/form/FormSubmitButton.tsx';
import { StreamInfo } from '@/pages/live/api/live.schema.ts';
import { headers, queryParams } from '@/shared/lib/schema/schema_common.ts';
import { LIVES_QUERY_KEY } from '@/pages/live/config/constants.ts';

const formSchema = z.object({
  type: platformNameEnum,
  uid: z.string().nonempty(),
  streamUrl: z.string(),
  streamParams: z.string(),
  streamHeaders: z.string(),
});

export function LiveCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogButton label="Append" title="Add New Live" closeRef={closeBtnRef}>
      <CreateForm cb={() => closeBtnRef.current?.click()} />
    </DialogButton>
  );
}

export function CreateForm({ cb }: { cb: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'chzzk',
      uid: '',
      streamUrl: '',
      streamParams: '',
      streamHeaders: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    let streamUrl: string | null = data.streamUrl.trim();
    if (streamUrl.length === 0) {
      streamUrl = null;
    }
    let paramsStr: string | null = data.streamParams.trim();
    if (paramsStr.length === 0) {
      paramsStr = null;
    }
    let headersStr: string | null = data.streamHeaders.trim();
    if (headersStr.length === 0) {
      headersStr = null;
    }
    let stream: StreamInfo | null = null;
    if (streamUrl && headersStr) {
      stream = {
        url: streamUrl,
        params: paramsStr ? queryParams.parse(JSON.parse(paramsStr)) : null,
        headers: headers.parse(JSON.parse(headersStr)),
      };
    }

    await createLive(data.uid, data.type, stream);
    await queryClient.invalidateQueries({ queryKey: [LIVES_QUERY_KEY] });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SelectFormField form={form} name="type" label="Platform">
          <SelectItem value="chzzk">CHZZK</SelectItem>
          <SelectItem value="soop">SOOP</SelectItem>
        </SelectFormField>
        <TextFormField form={form} name="uid" label="Channel UID" />
        <TextFormField form={form} name="streamUrl" label="Stream URL" />
        <TextFormField form={form} name="streamParams" label="Stream Params" />
        <TextFormField form={form} name="streamHeaders" label="Stream Headers" />
        <FormSubmitButton />
      </form>
    </Form>
  );
}
