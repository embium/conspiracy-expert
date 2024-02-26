import React from 'react';

import {
  Box,
  Card,
  CardBody,
  Heading,
  IconButton,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuPenLine, LuTrash2 } from 'react-icons/lu';

import { ConfirmModal } from '@/components/ConfirmModal';
import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { useToastError } from '@/components/Toast';
import { AdminBackButton } from '@/features/admin/AdminBackButton';
import { LinkAdmin } from '@/features/admin/LinkAdmin';
import { ADMIN_PATH } from '@/features/admin/constants';
import { trpc } from '@/lib/trpc/client';

import {
  AppLayoutPage,
  AppLayoutPageContent,
  AppLayoutPageTopBar,
} from './AppLayoutPage';

export default function PageAdminThread() {
  const { t } = useTranslation(['common', 'threads']);

  const toastError = useToastError();
  const trpcUtils = trpc.useUtils();

  const router = useRouter();
  const params = useParams();
  const thread = trpc.threads.getById.useQuery({
    id: Number(params.id),
  });

  const threadRemove = trpc.threads.removeById.useMutation({
    onSuccess: async () => {
      await trpcUtils.threads.getAll.invalidate();
      router.replace(`${ADMIN_PATH}/threads`);
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
        leftActions={<AdminBackButton />}
        rightActions={
          <>
            <ResponsiveIconButton
              as={LinkAdmin}
              href={`/threads/${params?.id}/update`}
              icon={<LuPenLine />}
            >
              {t('common:actions.edit')}
            </ResponsiveIconButton>

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
          </>
        }
      >
        {thread.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
        {thread.isSuccess && <Heading size="sm">{thread.data?.title}</Heading>}
      </AppLayoutPageTopBar>
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
                  <Text>{thread.data?.body || <small>-</small>}</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        )}
      </AppLayoutPageContent>
    </AppLayoutPage>
  );
}
