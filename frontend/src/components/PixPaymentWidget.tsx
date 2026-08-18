import React, { useState } from 'react';
import { QrCode, Copy, Check, Calendar, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface PixPaymentWidgetProps {
  pixKey: string;
  pixKeyType: string;
  monthlyFee: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export const PixPaymentWidget: React.FC<PixPaymentWidgetProps> = ({
  pixKey,
  pixKeyType,
  monthlyFee,
  dueDate,
  status
}) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">{t('payment')}</h3>
            <p className="text-xs text-slate-400">PIX</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
          status === 'PAID'
            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
            : status === 'OVERDUE'
            ? 'bg-rose-950/80 text-rose-400 border-rose-800/60'
            : 'bg-amber-950/80 text-amber-400 border-amber-800/60'
        }`}>
          {status === 'PAID' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('paid')}</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{status === 'OVERDUE' ? t('overdue') : t('pending')}</span>
            </>
          )}
        </div>
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('monthlyFee')}</span>
          </div>
          <span className="text-xl font-black text-white">
            R$ {monthlyFee.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('dueDate')}</span>
          </div>
          <span className="text-base font-bold text-white">
            {dueDate}
          </span>
        </div>
      </div>

      {/* PIX Key Box */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>{t('pixKey')} ({pixKeyType}):</span>
          <span className="text-[10px] text-emerald-400 font-semibold uppercase">Copia e Cola</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={pixKey}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono select-all focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('copied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t('copyPixKeyBtn')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulated QR Code */}
      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 flex flex-col items-center gap-3">
        <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-inner flex items-center justify-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixKey)}`}
            alt="PIX QR Code"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-[11px] text-slate-400 text-center max-w-xs">
          {t('scanQrCodeDesc')}
        </p>
      </div>

    </div>
  );
};
