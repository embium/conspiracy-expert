import React from 'react';

import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuProps,
  Portal,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuEye, LuPenLine, LuTrash2 } from 'react-icons/lu';

import { ActionsButton } from '@/components/ActionsButton';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Icon } from '@/components/Icons';
import { useToastError } from '@/components/Toast';
import { LinkAdmin } from '@/features/admin/LinkAdmin';
import { trpc } from '@/lib/trpc/client';
import type { RouterOutputs } from '@/lib/trpc/types';

export type ThreadActionProps = Omit<MenuProps, 'children'> & {
  thread: RouterOutputs['threads']['getAll']['items'][number];
};

export const AdminThreadActions = ({ thread, ...rest }: ThreadActionProps) => {
  const { t } = useTranslation(['common', 'threads']);
  const trpcUtils = trpc.useUtils();

  const toastError = useToastError();

  const threadRemove = trpc.threads.removeById.useMutation({
    onSuccess: async () => {
      await trpcUtils.threads.getAll.invalidate();
    },
    onError: () => {
      toastError({
        title: t('threads:feedbacks.deleteThreadError.title'),
        description: t('threads:feedbacks.deleteThreadError.description'),
      });
    },
  });

  return (
    <Menu placement="left-start" {...rest}>
      <MenuButton as={ActionsButton} isLoading={threadRemove.isLoading} />
      <Portal>
        <MenuList>
          <MenuItem
            as={LinkAdmin}
            href={`/threads/${thread.id}`}
            icon={<Icon icon={LuEye} fontSize="lg" color="gray.400" />}
          >
            {t('threads:list.actions.view')}
          </MenuItem>
          <MenuItem
            as={LinkAdmin}
            href={`/threads/${thread.id}/update`}
            icon={<Icon icon={LuPenLine} fontSize="lg" color="gray.400" />}
          >
            {t('common:actions.edit')}
          </MenuItem>
          <MenuDivider />
          <ConfirmModal
            title={t('threads:deleteModal.title')}
            message={t('threads:deleteModal.message', {
              name: thread.title,
            })}
            onConfirm={() => threadRemove.mutate({ id: thread.id })}
            confirmText={t('common:actions.delete')}
            confirmVariant="@dangerSecondary"
          >
            <MenuItem
              icon={<Icon icon={LuTrash2} fontSize="lg" color="gray.400" />}
            >
              {t('common:actions.delete')}
            </MenuItem>
          </ConfirmModal>
        </MenuList>
      </Portal>
    </Menu>
  );
};
