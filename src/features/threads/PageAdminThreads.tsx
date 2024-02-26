import React from 'react';

import {
  Button,
  Flex,
  HStack,
  Heading,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useQueryState } from 'nuqs';
import { Trans, useTranslation } from 'react-i18next';
import { LuBookMarked, LuPlus } from 'react-icons/lu';

import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/DataList';
import { Icon } from '@/components/Icons';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SearchInput } from '@/components/SearchInput';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
} from '@/features/admin/AdminLayoutPage';
import { LinkAdmin } from '@/features/admin/LinkAdmin';
import { AdminThreadActions } from '@/features/threads/AdminThreadActions';
import { trpc } from '@/lib/trpc/client';

export default function PageAdminThreads() {
  const { t } = useTranslation(['threads']);
  const [searchTerm, setSearchTerm] = useQueryState('s', { defaultValue: '' });

  const threads = trpc.threads.getAll.useInfiniteQuery(
    { searchTerm },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <AdminLayoutPage>
      <AdminLayoutPageContent>
        <Stack spacing={4}>
          <HStack spacing={4} alignItems={{ base: 'end', md: 'center' }}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              rowGap={2}
              columnGap={4}
              alignItems={{ base: 'start', md: 'center' }}
              flex={1}
            >
              <Heading flex="none" size="md">
                {t('threads:list.title')}
              </Heading>
              <SearchInput
                value={searchTerm}
                size="sm"
                onChange={(value) => setSearchTerm(value || null)}
                maxW={{ base: 'none', md: '20rem' }}
              />
            </Flex>
            <ResponsiveIconButton
              as={LinkAdmin}
              href="/threads/create"
              variant="@primary"
              size="sm"
              icon={<LuPlus />}
            >
              {t('threads:list.actions.createThread')}
            </ResponsiveIconButton>
          </HStack>

          <DataList>
            {threads.isLoading && <DataListLoadingState />}
            {threads.isError && (
              <DataListErrorState
                title={t('threads:feedbacks.loadingThreadError.title')}
                retry={() => threads.refetch()}
              />
            )}
            {threads.isSuccess &&
              !threads.data.pages.flatMap((p) => p.items).length && (
                <DataListEmptyState searchTerm={searchTerm}>
                  {t('threads:list.empty')}
                </DataListEmptyState>
              )}

            {threads.data?.pages
              .flatMap((p) => p.items)
              .map((thread) => (
                <DataListRow as={LinkBox} key={thread.id} withHover>
                  <DataListCell w="auto">
                    <Icon icon={LuBookMarked} fontSize="xl" color="gray.400" />
                  </DataListCell>
                  <DataListCell>
                    <DataListText fontWeight="bold">
                      <LinkOverlay
                        as={LinkAdmin}
                        href={`/threads/${thread.id}`}
                      >
                        {thread.title}
                      </LinkOverlay>
                    </DataListText>
                  </DataListCell>
                  <DataListCell flex={2} display={{ base: 'none', md: 'flex' }}>
                    <DataListText noOfLines={2} color="text-dimmed">
                      {thread.body}
                    </DataListText>
                  </DataListCell>
                  <DataListCell w="auto">
                    <AdminThreadActions thread={thread} />
                  </DataListCell>
                </DataListRow>
              ))}
            {threads.isSuccess && (
              <DataListRow mt="auto">
                <DataListCell w="auto">
                  <Button
                    size="sm"
                    onClick={() => threads.fetchNextPage()}
                    isLoading={threads.isFetchingNextPage}
                    isDisabled={!threads.hasNextPage}
                  >
                    {t('threads:list.loadMore.button')}
                  </Button>
                </DataListCell>
                <DataListCell>
                  {threads.isSuccess && !!threads.data.pages[0]?.total && (
                    <Text fontSize="xs" color="text-dimmed">
                      <Trans
                        i18nKey="threads:list.loadMore.display"
                        t={t}
                        values={{
                          loaded: threads.data.pages.flatMap((p) => p.items)
                            .length,
                          total: threads.data.pages[0].total,
                        }}
                      />
                    </Text>
                  )}
                </DataListCell>
              </DataListRow>
            )}
          </DataList>
        </Stack>
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
