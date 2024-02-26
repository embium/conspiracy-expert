import React, { useContext, useMemo } from 'react';

import {
  Box,
  ButtonGroup,
  Container,
  ContainerProps,
  Flex,
  FlexProps,
  HStack,
  Stack,
} from '@chakra-ui/react';
import useMeasure from 'react-use-measure';

import {
  AppLayoutContextNavDisplayed,
  useAppLayoutHideNav,
} from '@/features/app/AppLayout';

type AppLayoutPageContextValue = {
  noContainer: boolean;
  containerMaxWidth: ContainerProps['maxW'];
  nav: React.ReactNode;
};

const AppLayoutPageContext =
  React.createContext<AppLayoutPageContextValue | null>(null);

const useAppLayoutPageContext = () => {
  const context = useContext(AppLayoutPageContext);
  if (context === null) {
    throw new Error('Missing parent <AppLayoutPage> component');
  }
  return context;
};

export const PageContainer = ({ children, maxW, ...rest }: ContainerProps) => {
  const { noContainer, containerMaxWidth } = useAppLayoutPageContext();

  if (noContainer) return <>{children}</>;
  return (
    <Container
      display="flex"
      flexDirection="column"
      flex="1"
      w="full"
      maxW={maxW ?? containerMaxWidth}
      {...rest}
    >
      {children}
    </Container>
  );
};

type AppLayoutPageProps = FlexProps & {
  showNavBar?: AppLayoutContextNavDisplayed;
  containerMaxWidth?: ContainerProps['maxW'];
  noContainer?: boolean;
  nav?: React.ReactNode;
};

export const AppLayoutPage = ({
  showNavBar = true,
  noContainer = false,
  containerMaxWidth = 'container.md',
  children,
  ...rest
}: AppLayoutPageProps) => {
  useAppLayoutHideNav(showNavBar);

  const value = useMemo(
    () => ({
      noContainer,
      containerMaxWidth: containerMaxWidth,
      nav: null,
    }),
    [containerMaxWidth, noContainer]
  );

  return (
    <AppLayoutPageContext.Provider value={value}>
      <Flex
        position="relative"
        zIndex="1"
        direction="column"
        flex="1"
        pt="safe-top"
        {...rest}
      >
        <PageContainer pt={4} pb={16}>
          {children}
        </PageContainer>
        <Box w="full" h="0" pb="safe-bottom" />
      </Flex>
    </AppLayoutPageContext.Provider>
  );
};

type AppLayoutPageTopBarProps = FlexProps & {
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  isFixed?: boolean;
  isConfirmDiscardChanges?: boolean;
  containerMaxWidth?: ContainerProps['maxW'];
};

export const ADMIN_NAV_BAR_HEIGHT = `calc(4rem + env(safe-area-inset-top))`;

export const AppLayoutPageTopBar = ({
  children,
  leftActions,
  rightActions,
  isFixed = true,
  containerMaxWidth,
  ...rest
}: AppLayoutPageTopBarProps) => {
  const [ref, { height }] = useMeasure();

  return (
    <>
      {isFixed && <Box h={`${height}px`} />}
      <Flex
        zIndex={2}
        direction="column"
        py={3}
        boxShadow="layout"
        bg="white"
        ref={ref}
        borderBottom="1px solid transparent"
        borderBottomColor="gray.100"
        _dark={{
          bg: 'gray.900',
          color: 'white',
          borderBottomColor: 'gray.800',
          boxShadow: 'layout-dark',
        }}
        {...(isFixed
          ? {
              position: 'fixed',
              right: '0',
              left: '0',
            }
          : {})}
        {...rest}
      >
        <Box w="full" h="0" pb="safe-top" />
        <PageContainer maxW={containerMaxWidth}>
          <HStack spacing="4">
            {!!leftActions && (
              <ButtonGroup size="sm" spacing={3}>
                {leftActions}
              </ButtonGroup>
            )}
            <Box flex="1">{children}</Box>
            {!!rightActions && (
              <ButtonGroup size="sm" spacing={3}>
                {rightActions}
              </ButtonGroup>
            )}
          </HStack>
        </PageContainer>
      </Flex>
    </>
  );
};

type AppLayoutPageContentProps = FlexProps & {
  onBack?(): void;
  showBack?: boolean;
  containerMaxWidth?: ContainerProps['maxW'];
};

export const AppLayoutPageContent = ({
  children,
  containerMaxWidth,
  ...rest
}: AppLayoutPageContentProps) => {
  const { nav } = useAppLayoutPageContext();
  return (
    <Flex
      position="relative"
      zIndex="1"
      direction="column"
      flex="1"
      py="4"
      {...rest}
    >
      <PageContainer maxW={containerMaxWidth} pb={16}>
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          spacing={{ base: '4', lg: '8' }}
          flex="1"
        >
          {nav && (
            <Flex direction="column" minW="0" w={{ base: 'full', lg: '12rem' }}>
              {nav}
            </Flex>
          )}
          <Flex direction="column" flex="1" minW="0">
            {children}
          </Flex>
        </Stack>
      </PageContainer>
      <Box w="full" h="0" pb="safe-bottom" />
    </Flex>
  );
};
