import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** Neutral stand-in for screens whose feature ships in a later phase. */
export function Placeholder({ title, phase, children }: { title: string; phase: string; children?: ReactNode }) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Wiring lands in {phase}.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {children ?? 'This screen is scaffolded. Its data and forms arrive in the phase above.'}
      </CardContent>
    </Card>
  );
}
