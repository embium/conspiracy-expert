import React from 'react';

import { Button, Heading, SkeletonText, Stack } from '@chakra-ui/react';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { AdminBackButton } from '@/features/admin/AdminBackButton';
import { AdminCancelButton } from '@/features/admin/AdminCancelButton';
import { ThreadForm, ThreadFormFields } from '@/features/threads/ThreadForm';
import { trpc } from '@/lib/trpc/client';
import { isErrorDatabaseConflict } from '@/lib/trpc/errors';

import {
  AppLayoutPage,
  AppLayoutPageContent,
  AppLayoutPageTopBar,
} from './AppLayoutPage';
import MarkdownComponent from './MarkdownComponent';

export default function PageAdminThreadUpdate() {
  const { t } = useTranslation(['common', 'threads']);
  const trpcUtils = trpc.useUtils();

  const params = useParams();
  const router = useRouter();
  const thread = trpc.threads.getById.useQuery(
    {
      id: Number(params.id),
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const isReady = !thread.isFetching;

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const [bodyPreview, setBodyPreview] = React.useState('');

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
    onValuesChange: (values) => {
      setBodyPreview(values.body);
    },
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
      <AppLayoutPage containerMaxWidth="container.md" showNavBar={true}>
        <AppLayoutPageTopBar
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
        </AppLayoutPageTopBar>
        {!isReady && <LoaderFull />}
        {isReady && thread.isError && <ErrorPage />}
        {isReady && thread.isSuccess && (
          <AppLayoutPageContent>
            <Tabs>
              <TabList>
                <Tab>Write</Tab>
                <Tab>Preview</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <ThreadForm />
                </TabPanel>
                <TabPanel>
                  <MarkdownComponent body={bodyPreview} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </AppLayoutPageContent>
        )}
      </AppLayoutPage>
    </Formiz>
  );
}
