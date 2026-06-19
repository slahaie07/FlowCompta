import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { User, Mail, Key, Shield, ShieldCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { OrganicLoader } from '../../../components/ui/OrganicLoader';
import { useLanguage } from '../../../hooks/useLanguage';
import { LanguageCode } from '../../../lib/i18n';

const localeMap: Record<LanguageCode, string> = {
  fr: 'fr-CA',
  en: 'en-CA',
  ar: 'ar-CA',
};

export function SuperAdminSubAdmins() {
  const { t, lang } = useLanguage();
  const locale = localeMap[lang] || 'fr-CA';
  const [loading, setLoading] = useState(true);
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadSubAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'sub_admin')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSubAdmins(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(t('superAdminSubAdmins.toastLoadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubAdmins();
  }, []);

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error(t('superAdminSubAdmins.toastFillAll'));
      return;
    }
    setIsCreating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Session expirée. Reconnectez-vous.');

      const response = await fetch('/api/admin/create-sub-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t('superAdminSubAdmins.toastCreateError'));

      toast.success(t('superAdminSubAdmins.toastCreated').replace('{name}', fullName));
      setFullName('');
      setEmail('');
      setPassword('');
      loadSubAdmins();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t('superAdminSubAdmins.toastCreateError'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
          {t('superAdminSubAdmins.title')}{' '}
          <span className="animated-gradient-text italic">{t('superAdminSubAdmins.titleAccent')}</span>
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="w-8 h-[1px] bg-gold/50"></span>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">
            {t('superAdminSubAdmins.subtitle')}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-8 premium-border-gold lg:col-span-1 h-fit" glow="gold">
          <h2 className="text-xl font-serif font-bold text-ivoire mb-6 flex items-center gap-2">
            <Shield size={20} className="text-gold" aria-hidden /> {t('superAdminSubAdmins.newFirmTitle')}
          </h2>
          <form onSubmit={handleCreateSubAdmin} className="space-y-5">
            <Input
              type="text"
              placeholder={t('superAdminSubAdmins.placeholderName')}
              icon={<User size={18} className="text-gold/40" />}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder={t('superAdminSubAdmins.placeholderEmail')}
              icon={<Mail size={18} className="text-gold/40" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder={t('superAdminSubAdmins.placeholderPassword')}
              icon={<Key size={18} className="text-gold/40" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button
              type="submit"
              variant="gold"
              className="w-full h-14 uppercase tracking-widest font-black text-xs"
              isLoading={isCreating}
            >
              {t('superAdminSubAdmins.submit')}
            </Button>
          </form>
        </Card>

        <Card className="p-8 glass-card lg:col-span-2">
          <h2 className="text-xl font-serif font-bold text-ivoire mb-6 flex items-center gap-2">
            <ShieldCheck size={20} className="text-gold" aria-hidden /> {t('superAdminSubAdmins.registeredTitle')}
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <OrganicLoader label="COM" size="sm" />
            </div>
          ) : subAdmins.length > 0 ? (
            <div className="space-y-4">
              {subAdmins.map((sa) => (
                <div
                  key={sa.id}
                  className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gold/30 transition-all duration-300"
                >
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-lg text-ivoire">
                      {sa.full_name || t('superAdmin.noName')}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{sa.email}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 bg-gold/5 border border-gold/10 px-3 py-1.5 rounded-lg text-gold font-bold uppercase tracking-wider text-xs">
                      <Clock size={12} aria-hidden />
                      <span>
                        {t('superAdminSubAdmins.registeredOn')}{' '}
                        {new Date(sa.created_at).toLocaleDateString(locale)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 italic py-10">{t('superAdminSubAdmins.empty')}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
