'use client';

import React from 'react';
import { LoginForm } from '@/components/ui/login-form';
import { SignupForm } from '@/components/ui/signup-form';
import { createPortal } from 'react-dom';

type AuthModalProps = {
  open: boolean;
  mode?: 'login' | 'signup';
  onClose: () => void;
};

export function AuthModal({ open, onClose, mode = 'login' }: AuthModalProps) {
  const [current, setCurrent] = React.useState<'login' | 'signup'>(mode);
  React.useEffect(() => setCurrent(mode), [mode]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-[101] w-full max-w-md px-4">
        <div className="rounded-xl shadow-lg">
          {current === 'login' ? (
            <LoginForm className="" onSwitchToSignup={() => setCurrent('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setCurrent('login')} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}


