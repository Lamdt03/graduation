import React from 'react';

const Welcome: React.FC = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #6B46C1, #ED64A6, #F56565)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative background elements */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.2
            }}>
                <div style={{
                    width: '16rem',
                    height: '16rem',
                    background: '#F6E05E',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '-8rem',
                    left: '-8rem',
                    filter: 'blur(50px)'
                }}></div>
                <div style={{
                    width: '24rem',
                    height: '24rem',
                    background: '#4299E1',
                    borderRadius: '50%',
                    position: 'absolute',
                    bottom: '-12rem',
                    right: '-6rem',
                    filter: 'blur(50px)'
                }}></div>
            </div>

            <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                textAlign: 'center',
                marginBottom: '1.5rem',
                textShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                fontFamily: '"Inter", sans-serif'
            }}>
                Welcome to File Management System!
            </h1>
            <p style={{
                fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                color: '#FEF3C7',
                textAlign: 'center',
                maxWidth: '48rem',
                fontWeight: 500,
                lineHeight: 1.6,
                fontFamily: '"Inter", sans-serif'
            }}>
                Effortlessly organize your files, collaborate with your team, and streamline your workflow with our powerful system.
            </p>
        </div>
    );
};

export default Welcome;