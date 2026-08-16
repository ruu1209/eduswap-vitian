import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import { getApiErrorMessage, getApiErrorCode } from '@/utils/apiError';
import { loginSchema, type LoginValues } from '@/features/auth/schemas';

interface LocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? ROUTES.RESOURCES;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      if (getApiErrorCode(err) === 'EMAIL_NOT_VERIFIED') {
        toast.info('Verify your email to continue');
        navigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(values.email)}`);
        return;
      }
      toast.error(getApiErrorMessage(err, 'Could not log in'));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Log in to your EduSwap account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="College email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
          </Field>

          <div className="flex justify-end">
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Log in
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New here?{' '}
            <Link to={ROUTES.SIGNUP} className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
