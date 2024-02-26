import React from 'react';

import { Box, Card, CardBody, IconButton, Stack, Text } from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuPenLine, LuTrash2 } from 'react-icons/lu';

import { ConfirmModal } from '@/components/ConfirmModal';
import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { useToastError } from '@/components/Toast';
import {
  AppLayoutPage,
  AppLayoutPageContent,
  AppLayoutPageTopBar,
} from '@/features/app/AppLayoutPage';
import { trpc } from '@/lib/trpc/client';

import { AppBackButton } from '../app/AppBackButton';
import MarkdownComponent from '../app/MarkdownComponent';

export default function PageThread() {
  const { t } = useTranslation(['common', 'threads']);

  const toastError = useToastError();
  const trpcUtils = trpc.useUtils();

  const router = useRouter();
  const params = useParams();
  const thread = trpc.threads.getById.useQuery({
    id: Number(params.id),
  });

  const isThreadOwner = trpc.threads.isThreadOwner.useQuery({
    id: Number(thread.data?.id),
  });

  const threadRemove = trpc.threads.removeById.useMutation({
    onSuccess: async () => {
      await trpcUtils.threads.getAll.invalidate();
      router.replace(`/app/`);
    },
    onError: () => {
      toastError({
        title: t('threads:feedbacks.deleteThreadError.title'),
        description: t('threads:feedbacks.deleteThreadError.description'),
      });
    },
  });

  return (
    <AppLayoutPage showNavBar={true} containerMaxWidth="container.md">
      <AppLayoutPageTopBar
        leftActions={<AppBackButton />}
        rightActions={
          <>
            {isThreadOwner.data && (
              <ResponsiveIconButton
                as="a"
                href={`/app/${params?.id}/update`}
                icon={<LuPenLine />}
              >
                {t('common:actions.edit')}
              </ResponsiveIconButton>
            )}

            {isThreadOwner.data && (
              <ConfirmModal
                title={t('threads:deleteModal.title')}
                message={t('threads:deleteModal.message', {
                  name: thread.data?.title,
                })}
                onConfirm={() =>
                  thread.data &&
                  threadRemove.mutate({
                    id: thread.data.id,
                  })
                }
                confirmText={t('common:actions.delete')}
                confirmVariant="@dangerSecondary"
              >
                <IconButton
                  aria-label={t('common:actions.delete')}
                  icon={<LuTrash2 />}
                  isDisabled={!thread.data}
                  isLoading={threadRemove.isLoading}
                />
              </ConfirmModal>
            )}
          </>
        }
      ></AppLayoutPageTopBar>
      <AppLayoutPageContent>
        {thread.isLoading && <LoaderFull />}
        {thread.isError && <ErrorPage />}
        {thread.isSuccess && (
          <Card>
            <CardBody>
              <Stack spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">
                    {t('threads:data.name.label')}
                  </Text>
                  <Text>{thread.data?.title}</Text>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold">
                    {t('threads:data.description.label')}
                  </Text>
                  <MarkdownComponent body={thread.data?.body.toString()} />
                </Box>
              </Stack>
            </CardBody>
          </Card>
        )}
      </AppLayoutPageContent>
    </AppLayoutPage>
  );
}
