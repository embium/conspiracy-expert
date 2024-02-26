import React from 'react';

import { Button, Heading, SkeletonText, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
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

export default function PageAdminThreadUpdate() {
  const { t } = useTranslation(['common', 'threads']);
  const trpcUtils = trpc.useUtils();

  const params = useParams();
  const router = useRouter();
  const thread = trpc.threads.getById.useQuery(
    {
      id: params?.id?.toString() ?? '',
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const isReady = !thread.isFetching;

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const updateThread = trpc.threads.updateById.useMutation({
    onSuccess: async () => {
      await trpcUtils.threads.invalidate();
      toastSuccess({
        title: t('threads:update.feedbacks.updateSuccess.title'),
      });
      router.back();
    },
    onError: (error) => {
      if (isErrorDatabaseConflict(error, 'name')) {
        form.setErrors({ name: t('threads:data.name.alreadyUsed') });
        return;
      }
      toastError({
        title: t('threads:update.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<ThreadFormFields>({
    ready: isReady,
    initialValues: thread.data,
    onValidSubmit: (values) => {
      if (!thread.data?.id) return;
      updateThread.mutate({
        ...thread.data,
        ...values,
      });
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
                isLoading={updateThread.isLoading || updateThread.isSuccess}
                isDisabled={!form.isValid && form.isSubmitted}
              >
                {t('threads:update.action.save')}
              </Button>
            </>
          }
        >
          <Stack flex={1} spacing={0}>
            {thread.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
            {thread.isSuccess && (
              <Heading size="sm">{thread.data?.title}</Heading>
            )}
          </Stack>
        </AdminLayoutPageTopBar>
        {!isReady && <LoaderFull />}
        {isReady && thread.isError && <ErrorPage />}
        {isReady && thread.isSuccess && (
          <AdminLayoutPageContent>
            <ThreadForm />
          </AdminLayoutPageContent>
        )}
      </AdminLayoutPage>
    </Formiz>
  );
}
