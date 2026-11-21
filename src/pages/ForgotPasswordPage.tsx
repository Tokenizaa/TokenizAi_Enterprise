/**
 * NettosCorp — Forgot Password Page
 * Credential recovery entry point rebuilt on the design system.
 * WCAG 2.1 AA: bound label, aria-live status alert, autocomplete attribute.
 */

import React, { useState } from 'react';
import { authService } from '../services/authService';
import { ArrowLeft } from 'lucide-react';
import { Button, Input, Card, Alert } from '../design-system';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigate,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await authService.requestPasswordReset(email);
    setLoading(false);

    if (res.success) {
      setStatus({ type: 'success', text: res.message });
    } else {
      setStatus({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-nc-surface flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-md bg-nc-brand flex items-center justify-center text-nc-brand-text font-black text-lg mx-auto mb-3 shadow-card">
            N
          </div>
          <h1 className="text-xl font-bold tracking-tight text-nc-text font-sans">
            Recuperação de Credencial
          </h1>
          <p className="text-xs text-nc-text-muted mt-1">
            Redefinição de acesso institucional NettosCorp
          </p>
        </div>

        <Card padded paddingSize="md" className="shadow-lg">
          <button
            onClick={() => onNavigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs text-nc-text-muted hover:text-nc-text mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao login</span>
          </button>

          {status && (
            <Alert
              variant={status.type === 'success' ? 'success' : 'error'}
              title={
                status.type === 'success' ? 'Solicitação enviada' : 'Não foi possível enviar'
              }
              className="mb-4"
            >
              {status.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="reset-email"
              label="E-mail Corporativo"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu.nome@nettoscorp.com"
              error={
                status && status.type === 'error' ? status.text : undefined
              }
            />

            <Button
              type="submit"
              variant="default"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Disparando solicitação…' : 'Enviar Link de Redefinição'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
