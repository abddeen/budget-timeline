export default function Auth({ onSignIn, allowed }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center font-sans">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-[11px] font-semibold tracking-[2px] uppercase text-text-muted mb-4">
          Budget Timeline
        </div>
        <h1 className="text-3xl font-bold text-text-bright mb-2">
          Budget Planner
        </h1>
        <p className="text-text-muted text-sm mb-8">
          Track your financial timeline, expenses, and loan balances.
        </p>

        {allowed === false ? (
          <div className="bg-negative-bg border border-negative-deep rounded-xl p-6">
            <div className="text-negative font-semibold mb-2">Access Denied</div>
            <p className="text-negative-light text-sm">
              Your email is not authorized to access this app. Contact the administrator to be added to the allowlist.
            </p>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="bg-text-bright text-bg font-semibold py-3 px-8 rounded-lg text-sm cursor-pointer border-none hover:opacity-90 transition-opacity"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}
