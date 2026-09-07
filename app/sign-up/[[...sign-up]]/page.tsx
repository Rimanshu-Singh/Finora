import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand-header">
          <div className="brand">
            <span className="brand-mark">
              <i />
              <i />
              <i />
            </span>
            finora<span className="brand-dot">.</span>
          </div>
          <p className="auth-tagline">Personal finance, thoughtfully.</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full flex justify-center",
              card: "shadow-sm border border-[var(--border)] bg-[var(--bg)]",
            },
          }}
        />
      </div>
    </div>
  );
}
