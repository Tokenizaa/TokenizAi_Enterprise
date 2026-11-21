/**
 * NettosCorp — Login Page
 * Corporate authentication entry point rebuilt on the design system.
 * WCAG 2.1 AA: bound labels, aria-live error alert, visible focus states,
 * autocomplete attributes, and reduced-motion safe transitions.
 */

import React, { useState } from 'react';
import { authService } from '../services/authService';
import { UserRole } from '../types';
import { ROLE_LABELS } from '../services/permissionService';
import { ArrowRight, Shield } from 'lucide-react';
import {
  Button,
  Input,
  Card,
  Alert,
  Badge,
} from '../design-system';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: () => void;
}

const QUICK_ROLES: {
  email: string;
  role: UserRole;
  name: string;
  subtitle: string;
}[] = [
  {
    email: 'admin@nettoscorp.com',
    role: 'super_admin',
    name: 'Super Admin',
    subtitle: 'Dr. Orlando Netto',
  },
  {
    email: 'diretoria@nettoscorp.com',
    role: 'director',
    name: 'Diretoria (DEC/CNS)',
    subtitle: 'Helena Valença',
  },
  {
    email: 'gerencia@nettoscorp.com',
    role: 'manager',
    name: 'Gerência de Operações',
    subtitle: 'Marcus Bastos',
  },
  {
    email: 'auditor@nettoscorp.com',
    role: 'viewer',
    name: 'Auditor (Viewer)',
    subtitle: 'Gabriel Siqueira',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('admin@nettoscorp.com');
  const [password, setPassword] = useState('corporate123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await authService.login(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      onLoginSuccess();
      onNavigate('/dashboard');
    }
  };

  const handleQuickRole = async (targetEmail: string, role: UserRole) => {
    setEmail(targetEmail);
    setPassword('corporate123');
    setLoading(true);
    setError(null);

    const res = await authService.login(targetEmail, 'corporate123');
    setLoading(false);

    if (res.user) {
      authService.switchRole(role);
      onLoginSuccess();
      onNavigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-nc-surface flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Lockup */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-md bg-nc-brand flex items-center justify-center text-nc-brand-text font-black text-xl mx-auto mb-3 shadow-card">
          N
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-nc-text font-sans">
          NettosCorp Enterprise
        </h1>
        <p className="text-xs text-nc-text-muted mt-1">
          Plataforma Corporativa de Governança, IA e Auditoria
        </p>
      </div>

      {/* Card Form */}
      <Card padded paddingSize="md" className="w-full max-w-md shadow-lg">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-nc-text">Acesso Corporativo</h2>
          <p className="text-xs text-nc-text-muted mt-0.5">
            Autenticação integrada com Supabase Auth e RLS
          </p>
        </div>

        {error && (
          <Alert variant="error" title="Falha na autenticação" className="mb-5">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email"
            label="E-mail Institucional"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="usuario@nettoscorp.com"
            error={error && /e-mail/i.test(error || '') ? error : undefined}
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="login-password" className="text-xs font-medium text-nc-text-secondary">
                Senha de Acesso
              </label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-xs text-nc-brand hover:text-nc-brand-hover transition-colors underline-offset-4"
              >
                Recuperar senha?
              </button>
            </div>
            <Input
              id="login-password"
              labelHidden
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              error={error && /senha/i.test(error || '') ? error : undefined}
            />
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Validando Credenciais…' : 'Entrar na Plataforma'}
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Button>
        </form>

        {/* Quick Evaluator Access */}
        <div className="mt-6 pt-5 border-t border-nc-border">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-nc-text-muted block mb-3 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-nc-brand" />
            Acesso Rápido para Avaliação de Papéis
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_ROLES.map(qr => (
              <Button
                key={qr.email}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleQuickRole(qr.email, qr.role)}
                className="text-left justify-between"
              >
                <div className="flex flex-col leading-none">
                  <strong className="text-zinc-200 text-[11px]">{qr.name}</strong>
                  <span className="text-[10px] text-nc-text-muted truncate">
                    {qr.subtitle}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {ROLE_LABELS[qr.role]}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 text-center text-xs text-nc-text-muted font-mono">
          <span>RLS Enforced · ISO 27001 Aligned · NettosCorp Enterprise</span>
        </div>
      </Card>
    </div>
  );
};
