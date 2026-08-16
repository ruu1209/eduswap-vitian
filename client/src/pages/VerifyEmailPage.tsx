import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { ROUTES } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/apiError';
import { otpSchema, type OtpValues } from '@/features/auth/schemas';

interface LocationState {
  devOtp?: string;
}

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const location = useLocation();
  const devOtp = (location.state as LocationState | null)?.devOtp;

  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });

  // Without an email in the URL we can't verify anything — bounce to signup.
  if (!email) return <Navigate to={ROUTES.SIGNUP} replace />;

  const onSubmit = handleSubmit(async ({ otp }) => {
    try {
      await verifyEmail(email, otp);
      toast.success('Email verified — welcome to EduSwap');
      navigate(ROUTES.RESOURCES, { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Verification failed'));
    }
  });

  const onResend = async () => {
    setResending(true);
    try {
      const { message } = await authService.resendOtp(email);
      toast.success(message);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          Enter the 6-digit code we sent to <span className="font-medium text-foreground">{email}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {devOtp && (
          <p className="mb-4 rounded-md bg-secondary p-3 text-center font-mono text-sm">
            Dev code: <strong>{devOtp}</strong>
          </p>
        )}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Verification code" htmlFor="otp" error={errors.otp?.message}>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="text-center font-mono text-lg tracking-[0.5em]"
              {...register('otp')}
            />
          </Field>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="text-primary hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
          <Link to={ROUTES.LOGIN} className="text-muted-foreground hover:underline">
            Back to log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
