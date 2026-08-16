import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

/** Toast host, themed to match light/dark mode. Rendered once near the app root. */
export function Toaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme}
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'font-sans rounded-lg border border-border bg-card text-card-foreground',
        },
      }}
    />
  );
}
