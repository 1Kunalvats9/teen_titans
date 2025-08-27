'use client';

import React from 'react';
import { LoginForm } from '@/components/ui/login-form';
import { createPortal } from 'react-dom';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export function LoginModal({ open, onClose }: LoginModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-[101] w-full max-w-md px-4">
        <div className="rounded-xl shadow-lg">
          <LoginForm />
        </div>
      </div>
    </div>,
    document.body
  );
}


