import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { User, Mail, Key, Shield, ShieldCheck, Clock, Pencil, CheckCircle, XCircle, PauseCircle, PlayCircle } from 'lucide-react';
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

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

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

  const startEdit = (sa: any) => {
    setEditingId(sa.id);
    setEditName(sa.full_name || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEditName = async (id: string) => {
    if (!editName.trim()) {
      toast.error('Le nom ne peut pas être vide.');
      return;
    }
    setSavingId(id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editName.trim() })
        .eq('id', id);
      if (error) throw error;
      toast.success('Nom mis à jour.');
      setSubAdmins((prev) => prev.map((sa) => sa.id === id ? { ...sa, full_name: editName.trim() } : sa));
      setEditingId(null);
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour : ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const toggleSuspend = async (sa: any) => {
    const suspended = sa.metadata?.suspended === true;
    setSavingId(sa.id);
    try {
      const newMeta = { ...(sa.metadata || {}), suspended: !suspended };
      const { error } = await supabase
        .from('profiles')
        .update({ metadata: newMeta })
        .eq('id', sa.id);
      if (error) throw error;
      toast.success(suspended ? 'Compte réactivé.' : 'Compte suspendu.');
      setSubAdmins((prev) =>
        prev.map((p) => p.id === sa.id ? { ...p, metadata: newMeta } : p),
      );
    } catch (err: any) {
      toast.error('Erreur : ' + err.message);
    } finally {
      setSavingId(null);
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
              {subAdmins.map((sa) => {
                const suspended = sa.metadata?.suspended === true;
                const isEditing = editingId === sa.id;
                const isSaving = savingId === sa.id;

                return (
                  <div
                    key={sa.id}
                    className={`p-5 bg-white/[0.02] border rounded-2xl transition-all duration-300 ${suspended ? 'border-red-500/20 opacity-60' : 'border-white/5 hover:border-gold/30'}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') saveEditName(sa.id); if (e.key === 'Escape') cancelEdit(); }}
                              className="bg-white/5 border border-gold/30 rounded-lg px-3 py-1.5 text-ivoire font-serif font-bold text-base focus:outline-none focus:border-gold/60 flex-1"
                            />
                            <button
                              onClick={() => saveEditName(sa.id)}
                              disabled={isSaving}
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title="Confirmer"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-slate-500 hover:text-slate-300 transition-colors"
                              title="Annuler"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-base text-ivoire">
                              {sa.full_name || t('superAdmin.noName')}
                            </h3>
                            {suspended && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 uppercase tracking-wider">
                                Suspendu
                              </span>
                            )}
                            <button
                              onClick={() => startEdit(sa)}
                              className="text-slate-600 hover:text-gold transition-colors ml-1"
                              title="Modifier le nom"
                            >
                              <Pencil size={13} />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 font-mono">{sa.email}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-gold/5 border border-gold/10 px-3 py-1.5 rounded-lg text-gold font-bold text-xs">
                          <Clock size={11} aria-hidden />
                          <span>
                            {t('superAdminSubAdmins.registeredOn')}{' '}
                            {new Date(sa.created_at).toLocaleDateString(locale)}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleSuspend(sa)}
                          disabled={isSaving}
                          title={suspended ? 'Réactiver le compte' : 'Suspendre le compte'}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${suspended ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'}`}
                        >
                          {isSaving ? (
                            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : suspended ? (
                            <PlayCircle size={13} />
                          ) : (
                            <PauseCircle size={13} />
                          )}
                          {suspended ? 'Réactiver' : 'Suspendre'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-500 italic py-10">{t('superAdminSubAdmins.empty')}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
