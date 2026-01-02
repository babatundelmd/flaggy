import { X, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    const { signInWithGoogle } = useAuth();

    if (!isOpen) return null;

    // content click handler to prevent closing when clicking inside modal
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
            onClose();
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(5px)'
            }}
        >
            <div
                className="modal-content"
                onClick={handleContentClick}
                style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '24px',
                    width: '90%',
                    maxWidth: '400px',
                    position: 'relative',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <UserIcon size={32} color="var(--primary)" />
                    </div>

                    <h2 style={{ marginBottom: '0.5rem' }}>Join Flag Master</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Sign in to save your stats, climb the leaderboard, and compete with players worldwide.
                    </p>

                    <button
                        onClick={handleLogin}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            background: 'white',
                            border: '1px solid #e0e0e0',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.23856)">
                                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.439 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
