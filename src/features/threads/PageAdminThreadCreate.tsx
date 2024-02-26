import React from 'react';

import { Button, Heading } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useToastError, useToastSuccess } from '@/components/Toast';
import { AdminBackButton } from '@/features/admin/AdminBackButton';
import { AdminCancelButton } from '@/features/admin/AdminCancelButton';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
  AdminLayoutPageTopBar,
} from '@/features/admin/AdminLayoutPage';
import { ThreadForm, ThreadFormFields } from '@/features/threads/ThreadForm';
import { trpc } from '@/lib/trpc/client';
import { isErrorDatabaseConflict } from '@/lib/trpc/errors';

export default function PageAdminThreadCreate() {
  const { t } = useTranslation(['common', 'threads']);
  const trpcUtils = trpc.useUtils();
  const router = useRouter();

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const createThread = trpc.threads.create.useMutation({
    onSuccess: async () => {
      await trpcUtils.threads.getAll.invalidate();
      toastSuccess({
        title: t('threads:create.feedbacks.updateSuccess.title'),
      });
      router.back();
    },
    onError: (error) => {
      if (isErrorDatabaseConflict(error, 'name')) {
        form.setErrors({ name: t('threads:data.name.alreadyUsed') });
        return;
      }
      toastError({
        title: t('threads:create.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<ThreadFormFields>({
    onValidSubmit: (values) => {
      createThread.mutate(values);
    },
  });

  return (
    <Formiz connect={form} autoForm>
      <AdminLayoutPage containerMaxWidth="container.md" showNavBar={false}>
        <AdminLayoutPageTopBar
          leftActions={<AdminBackButton withConfrim={!form.isPristine} />}
          rightActions={
            <>
              <AdminCancelButton withConfrim={!form.isPristine} />
              <Button
                type="submit"
                variant="@primary"
                isLoading={createThread.isLoading || createThread.isSuccess}
                isDisabled={!form.isValid && form.isSubmitted}
              >
                {t('threads:create.action.save')}
              </Button>
            </>
          }
        >
          <Heading size="sm">{t('threads:create.title')}</Heading>
        </AdminLayoutPageTopBar>
        <AdminLayoutPageContent>
          <ThreadForm />
        </AdminLayoutPageContent>
      </AdminLayoutPage>
    </Formiz>
  );
}
