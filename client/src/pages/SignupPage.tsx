import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/apiError';
import { signupSchema, type SignupValues } from '@/features/auth/schemas';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { message, email, devOtp } = await signup({
        name: values.name,
        email: values.email,
        password: values.password,
        rollNumber: values.rollNumber || undefined,
      });
      toast.success(message);
      navigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(email)}`, { state: { devOtp } });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not create account'));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Use your college email — personal domains are rejected.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Full name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" autoComplete="name" {...register('name')} />
          </Field>
          <Field label="College email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            hint="8+ characters, with upper, lower and a number."
          >
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          </Field>
          <Field label="Roll number (optional)" htmlFor="rollNumber" error={errors.rollNumber?.message}>
            <Input id="rollNumber" {...register('rollNumber')} />
          </Field>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
