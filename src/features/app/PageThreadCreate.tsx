import React from 'react';

import { Button, Heading } from '@chakra-ui/react';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Markdown, { type Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialOceanic } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

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
} from '../app/AppLayoutPage';

export default function PageThreadCreate() {
  const { t } = useTranslation(['common', 'threads']);
  const trpcUtils = trpc.useUtils();
  const router = useRouter();
  const [bodyPreview, setBodyPreview] = React.useState('');

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
    onValuesChange: (values) => {
      setBodyPreview(values.body);
    },
    onValidSubmit: (values) => {
      createThread.mutate(values);
    },
  });

  const options: Components = {
    code: (props) => (
      <SyntaxHighlighter
        language={props.className?.replace(/(?:lang(?:uage)?-)/, '')}
        style={materialOceanic}
        wrapLines={true}
        className="not-prose rounded-md"
      >
        {String(props.children)}
      </SyntaxHighlighter>
    ),
  };

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
                isLoading={createThread.isLoading || createThread.isSuccess}
                isDisabled={!form.isValid && form.isSubmitted}
              >
                {t('threads:create.action.save')}
              </Button>
            </>
          }
        >
          <Heading size="sm">{t('threads:create.title')}</Heading>
        </AppLayoutPageTopBar>
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
                {' '}
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={options}
                >
                  {bodyPreview}
                </Markdown>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </AppLayoutPageContent>
      </AppLayoutPage>
    </Formiz>
  );
}
