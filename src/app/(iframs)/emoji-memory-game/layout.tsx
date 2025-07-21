
import { type Metadata } from 'next';
import ScrollConfig from '@/app/(iframs)/ScrollConfig';

export const metadata: Metadata = {
  title: '',
  description:
    '',
  keywords:
    '',
  creator: '',
  publisher: '',
  robots: 'index, follow',
};

export default function IframeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ScrollConfig>{children}</ScrollConfig>;
} 