import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOAuth2Exchange } from '../../api/hooks';
import { useAuthStore } from '../../stores/auth-store';

export default function LoginSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exchangeMutation = useOAuth2Exchange();
  const { login } = useAuthStore();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    if (!code) {
      navigate('/login', { replace: true });
      return;
    }

    exchangeMutation.mutateAsync({ code }).then((data) => {
      login(data.id, data.token);
      window.history.replaceState({}, '', '/login-success');
      toast.success('Signed in with Google');
      const target = useAuthStore.getState().isAdmin ? '/admin' : '/';
      navigate(target, { replace: true });
    }).catch((err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 410) {
        toast.error('Code expired or invalid, please login again');
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
      navigate('/login', { replace: true });
    });
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <span className="text-ink">Signing in...</span>
    </div>
  );
}
