import { Mail, Phone, MessageSquare, Clock, ShieldCheck, Send } from 'lucide-react';
import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { toast } from 'sonner';
import { useLanguage } from '../../../hooks/useLanguage';
import { usePortalNavigate } from '../../../hooks/usePortalNavigate';
import { useAuth } from '../../../hooks/useAuth';
import { CONFIG } from '../../../lib/config';
import { SupportLiveChat } from '../../features/components/SupportLiveChat';

export function Support() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const portalNavigate = usePortalNavigate();
  const { t } = useLanguage();
  const { user, userData } = useAuth();
  const supportEmail = CONFIG.APP.SUPPORT_EMAIL;
  const province = userData?.province;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
    setSent(true);
    toast.success(t('support.ticketSaved'));
    setTimeout(() => setSent(false), 5000);
  };

  const handleCopySMS = () => {
    navigator.clipboard.writeText('+18195551234');
    toast.success(t('support.smsCopied'));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-serif font-medium text-ivoire tracking-tight italic">
          {t('support.title')} <span className="text-gold">{t('support.titleAccent')}</span>
        </h1>
        <p className="text-slate-400 mt-1.5 text-sm font-light uppercase tracking-widest">{t('support.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6" glow="gold">
            <div className="mb-4">
              <h3 className="text-xl font-serif text-ivoire">{t('support.liveChatTitle')}</h3>
              <p className="text-xs text-slate-500 mt-1">{t('support.liveChatDesc')}</p>
            </div>
            <SupportLiveChat
              province={province}
              userId={user?.id}
              selectedServiceId={userData?.selectedServiceId}
            />
          </Card>

          <Card className="p-8" glow="gold">
            <h3 className="text-xl font-serif text-ivoire mb-6">{t('support.formTitle')}</h3>
            {sent ? (
              <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                  <Send size={24} />
                </div>
                <p className="text-ivoire font-medium">{t('support.sentTitle')}</p>
                <p className="text-xs text-slate-500">{t('support.sentDesc')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input label={t('support.subject')} placeholder={t('support.subjectPlaceholder')} value={subject} onChange={e => setSubject(e.target.value)} required />
                <div className="space-y-1.5">
                  <label htmlFor="support-message" className="text-sm font-medium text-slate-400 ml-1">{t('support.message')}</label>
                  <textarea
                    id="support-message"
                    className="w-full bg-noir border border-white/10 rounded-2xl px-4 py-4 text-ivoire text-sm min-h-[200px] outline-none focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 transition-all"
                    placeholder={t('support.messagePlaceholder')}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                  />
                </div>
                <div className="pt-4">
                  <Button variant="gold" className="w-full h-14 gap-2" type="submit">
                    {t('support.send')} <Send size={18} />
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h4 className="text-xs uppercase font-bold text-slate-500 tracking-widest border-b border-white/5 pb-4">{t('support.contacts')}</h4>

            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.href = `mailto:${supportEmail}`}>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-noir transition-all">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{t('support.email')}</p>
                <p className="text-sm text-ivoire font-medium">{supportEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group cursor-pointer" onClick={handleCopySMS}>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-noir transition-all">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{t('support.sms')}</p>
                <p className="text-sm text-ivoire font-medium">+1 (819) XXX-XXXX</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => portalNavigate('messaging')}>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{t('support.chat')}</p>
                <Badge variant="success">{t('support.available')}</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gold/5 border-gold/20" glow="gold">
            <div className="flex items-center gap-3 mb-4 text-gold">
              <Clock size={20} />
              <h4 className="text-sm font-bold uppercase tracking-widest">{t('support.hours')}</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-400 font-light">
              <li className="flex justify-between"><span>{t('support.weekdays')}</span> <span className="text-ivoire font-medium">09:00 - 17:00</span></li>
              <li className="flex justify-between"><span>{t('support.saturday')}</span> <span className="text-ivoire font-medium">{t('support.byAppt')}</span></li>
              <li className="flex justify-between"><span>{t('support.sunday')}</span> <span className="text-slate-600 font-medium italic">{t('support.closed')}</span></li>
            </ul>
          </Card>

          <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5">
            <ShieldCheck className="text-gold" size={18} />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-tight">{t('support.secureLine')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
