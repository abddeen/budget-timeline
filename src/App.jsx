import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import BudgetApp from './components/BudgetApp';

export default function App() {
  const { session, user, loading, allowed, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text-dim font-sans flex items-center justify-center">
        <div>⏳ Loading...</div>
      </div>
    );
  }

  if (!session || allowed === false) {
    return <Auth onSignIn={signInWithGoogle} allowed={allowed} />;
  }

  return <BudgetApp onSignOut={signOut} userEmail={user.email} />;
}
