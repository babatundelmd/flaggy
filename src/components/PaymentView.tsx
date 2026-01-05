import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { usePro } from '../contexts/ProContext';

const PaymentView: React.FC = () => {
    const navigate = useNavigate();
    const { unlockPro } = usePro();
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate payment processing delay
        setTimeout(() => {
            unlockPro();
            setIsProcessing(false);
            navigate('/');
        }, 2000);
    };

    return (
        <div className="payment-page" style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-gradient)',
            padding: '1rem'
        }}>
            <div className="payment-card" style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '32px',
                maxWidth: '450px',
                width: '100%',
                boxShadow: 'var(--shadow)',
                textAlign: 'center',
                position: 'relative'
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        position: 'absolute',
                        top: '2rem',
                        left: '2rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>

                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(217, 119, 6, 0.3)'
                }}>
                    <Sparkles size={40} fill="white" />
                </div>

                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Upgrade to PRO</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                    Unlock country outlines, the global explorer map, and support the project for just a one-time payment.
                </p>

                <div style={{
                    background: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '20px',
                    marginBottom: '2.5rem',
                    textAlign: 'left'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>PRO License</span>
                        <span style={{ fontWeight: 700 }}>$5.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                        <span>Total</span>
                        <span>$5.00</span>
                    </div>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="btn btn-primary"
                    style={{
                        height: '60px',
                        fontSize: '1.1rem',
                        background: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.8rem'
                    }}
                >
                    {isProcessing ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <CreditCard size={24} />
                            Pay $5.00
                        </>
                    )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--success)', fontSize: '0.85rem' }}>
                    <ShieldCheck size={16} />
                    <span>Secure checkout via Stripe</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentView;
