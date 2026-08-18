import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
          <span className="bg-[#A7F3D0] border border-black rounded-md px-1.5 py-0.5 text-black font-semibold text-xs leading-none">
            Edu
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">Swap</span>
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.RESOURCES}>Browse</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.BOOKS}>Marketplace</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.RESOURCE_UPLOAD}>Upload</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.SAVED}>Saved</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.CHAT}>Messages</Link>
              </Button>
              <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.LOGIN}>Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={ROUTES.SIGNUP}>Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
