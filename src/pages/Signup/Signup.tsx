import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import '../Login/Login.css';

export function Signup() {
    const { signUp, error } = useAuthStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setLocalError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters.');
            return;
        }
        setLocalError('');
        setSubmitting(true);
        await signUp(email, password);
        setSubmitting(false);
        if (!useAuthStore.getState().error) {
            navigate('/setup', { replace: true });
        }
    };

    const displayError = localError || error;

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card__brand">Cricket Auction</div>
                <h1 className="auth-card__title">Create account</h1>
                <p className="auth-card__sub">You'll be the admin for your auction group</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label">Email</label>
                        <input
                            className="auth-input"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <input
                            className="auth-input"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Confirm Password</label>
                        <input
                            className="auth-input"
                            type="password"
                            autoComplete="new-password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                        />
                    </div>

                    {displayError && <p className="auth-error">{displayError}</p>}

                    <button
                        className="auth-btn"
                        type="submit"
                        disabled={submitting || !email || !password || !confirm}
                    >
                        {submitting ? <span className="auth-spinner" /> : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
