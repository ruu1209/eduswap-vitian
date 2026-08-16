import { Placeholder } from '@/components/Placeholder';
import { useAuth } from '@/context/AuthContext';
export function ProfilePage() {
  const { user } = useAuth();
  return (
    <Placeholder title="Your profile" phase="Phase 4+">
      Signed in as {user?.email ?? 'unknown'}.
    </Placeholder>
  );
}
