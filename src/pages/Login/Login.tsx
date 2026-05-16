import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './Login.css';

export function Login() {
    const { signIn, error, loading } = useAuthStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        await signIn(email, password);
        setSubmitting(false);
        const { role } = useAuthStore.getState();
        if (role === 'admin') navigate('/dashboard', { replace: true });
        else if (role === 'captain') navigate('/owners', { replace: true });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card__brand">Cricket Auction</div>
                <h1 className="auth-card__title">Sign in</h1>
                <p className="auth-card__sub">Enter your credentials to continue</p>

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
                            autoComplete="current-password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button
                        className="auth-btn"
                        type="submit"
                        disabled={submitting || loading || !email || !password}
                    >
                        {submitting ? <span className="auth-spinner" /> : 'Sign In'}
                    </button>
                </form>

                <p className="auth-footer">
                    New here?{' '}
                    <Link to="/signup" className="auth-link">Create an admin account</Link>
                </p>
            </div>
        </div>
    );
}
