import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { registerSchema, type RegisterFormData } from '../../lib/schemas';
import { useRegister } from '../../api/hooks';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const OAUTH2_URL = import.meta.env.VITE_OAUTH2_URL;

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync(data);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center mx-auto mb-4"></div>
          <h1 className="font-mono text-2xl font-bold text-ink">Create account</h1>
          <p className="text-mute text-sm mt-1">Start shopping in minutes</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-canvas rounded-sm border border-hairline p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="firstName"
              label="First name"
              placeholder="John"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              id="lastName"
              label="Last name"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            id="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" size="lg" className="w-full" loading={registerMutation.isPending}>
            Create account
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-hairline" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-canvas px-2 text-ash">or</span>
          </div>
        </div>

        <a
          href={OAUTH2_URL}
          className="flex items-center justify-center gap-2 w-full rounded-sm border border-hairline px-4 py-2.5 text-sm font-medium text-body"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign up with Google
        </a>

        <p className="text-center text-sm text-mute mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
