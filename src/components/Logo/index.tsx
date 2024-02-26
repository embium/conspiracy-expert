import { ComponentProps, useId } from 'react';

import { chakra, useTheme } from '@chakra-ui/react';
import Image from 'next/image';

export const Logo = ({ ...rest }: ComponentProps<typeof chakra.svg>) => {
  const theme = useTheme();
  const gradientId = useId();
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width="200"
      height="200"
      style={{ filter: 'invert(50%)' }}
    />
  );
};
