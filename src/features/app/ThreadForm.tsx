import React from 'react';

import { Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { FieldTextarea } from '@/components/FieldTextarea';

export type ThreadFormFields = {
  title: string;
  body: string;
};

export const ThreadForm = () => {
  const { t } = useTranslation(['common', 'threads']);

  return (
    <Stack spacing={4}>
      <FieldInput
        name="title"
        label={t('threads:data.name.label')}
        required={t('threads:data.name.required')}
      />
      <FieldTextarea
        name="body"
        label={t('threads:data.description.label')}
        textareaProps={{ rows: 6 }}
      />
    </Stack>
  );
};
