import React from 'react';
import {
  Barcode,
  CarFront,
  ChartNoAxesCombined,
  CircleAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  PackageSearch,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import './auth-screen.css';

function getLoginError(error) {
  const message = String(error?.message || '');

  if (/failed to fetch|networkerror|fetch failed|load failed/i.test(message)) {
    return {
      kind: 'network',
      message: 'Cannot reach the server. Make sure the backend is running, then try again.',
    };
  }

  if (/too many|try again in|wait before trying/i.test(message)) {
    return {
      kind: 'rate-limit',
      message: 'Too many sign-in attempts. Please wait a moment, then try again.',
    };
  }

  if (/invalid|incorrect|unauthorized|credentials/i.test(message)) {
    return {
      kind: 'credentials',
      message: 'Invalid username or password.',
    };
  }

  return {
    kind: 'server',
    message: 'Unable to sign in right now. Please try again.',
  };
}

export default function AuthScreen({ authenticate, onLogin }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [capsLockOn, setCapsLockOn] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [fieldErrors, setFieldErrors] = React.useState({ username: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const usernameInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);
  const errorRef = React.useRef(null);
  const submittingRef = React.useRef(false);

  async function submitLogin(event) {
    event.preventDefault();
    if (submittingRef.current) return;

    const trimmedUsername = username.trim();
    const nextFieldErrors = {
      username: trimmedUsername ? '' : 'Username is required.',
      password: password ? '' : 'Password is required.',
    };

    if (nextFieldErrors.username || nextFieldErrors.password) {
      setFieldErrors(nextFieldErrors);
      const targetId = nextFieldErrors.username ? 'auth-username' : 'auth-password';
      document.getElementById(targetId)?.focus();
      return;
    }

    submittingRef.current = true;
    setError(null);
    setFieldErrors({ username: '', password: '' });
    setLoading(true);

    try {
      const session = await authenticate({ username: trimmedUsername, password });
      localStorage.setItem('fabians-session', JSON.stringify(session));
      onLogin(session);
    } catch (loginError) {
      const nextError = getLoginError(loginError);
      setError(nextError);

      if (nextError.kind === 'credentials') {
        setPassword('');
        window.requestAnimationFrame(() => passwordInputRef.current?.focus());
      } else {
        window.requestAnimationFrame(() => errorRef.current?.focus());
      }
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  function updateCapsLock(event) {
    setCapsLockOn(Boolean(event.getModifierState?.('CapsLock')));
  }

  function handleFieldChange(field, event) {
    event.currentTarget.setCustomValidity('');
    const value = event.currentTarget.value;

    if (field === 'username') {
      setUsername(value);
    } else {
      setPassword(value);
    }

    setError(null);
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  }

  function handleInvalid(field, message, event) {
    event.currentTarget.setCustomValidity(message);
    setFieldErrors((current) => ({ ...current, [field]: message }));
  }

  const feedbackMessage = error?.message || (capsLockOn ? 'Caps Lock is on.' : '');

  return (
    <main className="auth-screen">
      <div className="auth-backdrop" aria-hidden="true" />
      <section className="auth-layout">
        <div className="auth-promo">
          <header className="auth-brand">
            <span className="auth-brand-mark"><CarFront size={24} aria-hidden="true" /></span>
            <span>
              <strong>Fabian&apos;s</strong>
              <small>Car Care POS</small>
            </span>
          </header>

          <div className="auth-promo-copy">
            <span className="auth-kicker">Car Shop POS</span>
            <h1>Fabian&apos;s Car Care</h1>
            <p className="auth-tagline">Sell faster, track stock, and keep the shop moving.</p>
            <p className="auth-support">Daily checkout and inventory control built for a busy service counter.</p>

            <div className="auth-capabilities" aria-label="System capabilities">
              <div>
                <Barcode size={20} aria-hidden="true" />
                <span><strong>Barcode</strong><small>Fast checkout</small></span>
              </div>
              <div>
                <PackageSearch size={20} aria-hidden="true" />
                <span><strong>Stock</strong><small>Inventory alerts</small></span>
              </div>
              <div>
                <ChartNoAxesCombined size={20} aria-hidden="true" />
                <span><strong>Reports</strong><small>Sales tracking</small></span>
              </div>
            </div>
          </div>
        </div>

        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-panel-heading">
            <span className="auth-security-mark"><ShieldCheck size={22} aria-hidden="true" /></span>
            <div>
              <span className="auth-kicker">Secure Access</span>
              <h2 id="auth-title">Sign in to continue</h2>
              <p>Use your assigned owner, admin, or cashier account.</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={submitLogin} aria-busy={loading}>
            <label htmlFor="auth-username">Username</label>
            <div className={`auth-input ${fieldErrors.username ? 'is-invalid' : ''}`}>
              <UserRound size={18} aria-hidden="true" />
              <input
                ref={usernameInputRef}
                id="auth-username"
                value={username}
                onChange={(event) => handleFieldChange('username', event)}
                onInvalid={(event) => handleInvalid('username', 'Username is required.', event)}
                autoComplete="username"
                autoFocus
                autoCapitalize="none"
                spellCheck="false"
                enterKeyHint="next"
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby={fieldErrors.username ? 'auth-username-error' : undefined}
                required
              />
            </div>
            {fieldErrors.username && (
              <small id="auth-username-error" className="auth-field-error">
                {fieldErrors.username}
              </small>
            )}

            <label htmlFor="auth-password">Password</label>
            <div className={`auth-input ${fieldErrors.password ? 'is-invalid' : ''}`}>
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                ref={passwordInputRef}
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => handleFieldChange('password', event)}
                onInvalid={(event) => handleInvalid('password', 'Password is required.', event)}
                onKeyDown={updateCapsLock}
                onKeyUp={updateCapsLock}
                onBlur={() => setCapsLockOn(false)}
                autoComplete="current-password"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={[
                  fieldErrors.password ? 'auth-password-error' : '',
                  feedbackMessage ? 'auth-form-feedback' : '',
                ].filter(Boolean).join(' ') || undefined}
                required
              />
              <button
                className="auth-password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword
                  ? <EyeOff size={18} aria-hidden="true" />
                  : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {fieldErrors.password && (
              <small id="auth-password-error" className="auth-field-error">
                {fieldErrors.password}
              </small>
            )}

            {feedbackMessage && (
              <div
                ref={errorRef}
                id="auth-form-feedback"
                className={`auth-feedback ${error ? 'is-error' : 'is-warning'}`}
                role={error ? 'alert' : 'status'}
                aria-live={error ? 'assertive' : 'polite'}
                tabIndex={error ? -1 : undefined}
              >
                <CircleAlert size={17} aria-hidden="true" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading
                ? <LoaderCircle className="auth-loader" size={18} aria-hidden="true" />
                : <LogIn size={18} aria-hidden="true" />}
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <footer className="auth-panel-footer">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>Protected role-based access</span>
          </footer>
        </section>
      </section>
    </main>
  );
}
