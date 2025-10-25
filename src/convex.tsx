import { type ReactNode, useMemo } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

function createConvexClient(): ConvexReactClient | null {
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

  if (!convexUrl) {
    console.warn('No Convex URL provided. Skipping Convex integration.');
    return null;
  }

  try {
    const normalizedUrl = new URL(convexUrl);
    return new ConvexReactClient(normalizedUrl.toString());
  } catch (error) {
    console.error('Invalid Convex URL provided. Skipping Convex integration.', error);
    return null;
  }
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return createConvexClient();
  }, []);

  if (!convex) {
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}