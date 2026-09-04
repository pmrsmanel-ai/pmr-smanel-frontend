import React from 'react';
import {
  Coins,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

export default function FinanceAttention({
  dendaBelumLunas,
  kasBelumBayar,
  totalDana,
  rupiah,
}) {
  return (
    <div className="finance-dashboard-panel attention">
      <div className="finance-panel-header">
        <div>
          <span>MONITORING</span>
          <h2>Perlu Perhatian</h2>
        </div>
        <ShieldAlert size={18} />
      </div>

      <div className="finance-attention-list">
        <div className="finance-attention-item red">
          <div className="finance-attention-icon">
            <Coins size={17} />
          </div>

          <div>
            <strong>Denda Belum Lunas</strong>
            <span>
              Segera tindak lanjuti pembayaran anggota.
            </span>
          </div>

          <b>{rupiah(dendaBelumLunas)}</b>
        </div>

        <div className="finance-attention-item orange">
          <div className="finance-attention-icon">
            <Wallet size={17} />
          </div>

          <div>
            <strong>Kas Belum Bayar</strong>
            <span>
              Kewajiban Kas anggota yang masih terbuka.
            </span>
          </div>

          <b>{rupiah(kasBelumBayar)}</b>
        </div>

        <div className="finance-attention-item green">
          <div className="finance-attention-icon">
            <ShieldCheck size={17} />
          </div>

          <div>
            <strong>Saldo Total</strong>
            <span>Posisi dana saat ini.</span>
          </div>

          <b>{rupiah(totalDana)}</b>
        </div>
      </div>
    </div>
  );
}