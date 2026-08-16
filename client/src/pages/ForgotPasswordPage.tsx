import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/authService';
import { ROUTES } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/apiError';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schemas';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { message, devResetToken } = await authService.forgotPassword(values.email);
      toast.success(message);
      setSent(true);
      // In development the server returns the token so you can test the flow end to end.
      if (devResetToken) setDevLink(`${ROUTES.RESET_PASSWORD}?token=${devResetToken}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>We'll email a reset link if the account exists.</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Check your inbox for a link to reset your password.</p>
            {devLink && (
              <p className="rounded-md bg-secondary p-3 font-mono text-xs">
                Dev link:{' '}
                <Link to={devLink} className="text-primary hover:underline">
                  {devLink}
                </Link>
              </p>
            )}
            <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
              Back to log in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Field label="College email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
            </Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send reset link
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Remembered it?{' '}
              <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
