import React from 'react';

import {
  Database,
  Gavel,
  KeyRound,
  Settings2,
  ShieldCheck,
  Users,
} from 'lucide-react';

function SettingCard({
  icon: Icon,
  title,
  description,
  status,
  tone,
  children,
}) {
  return (
    <section className={`settings-card ${tone}`}>
      <div className="settings-card-head">
        <div className="settings-card-icon">
          <Icon size={19} />
        </div>

        <div>
          <span>{status}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

export default function PengaturanPage() {
  return (
    <div className="settings-page">
      <section className="settings-hero">
        <div>
          <span className="eyebrow light">
            ADMIN UTAMA
          </span>

          <h1>
            Pengaturan Sistem
          </h1>

          <p>
            Pusat administrasi untuk
            mengelola akses, aturan,
            dan konfigurasi Sistem
            Manajemen PMR SMANEL.
          </p>
        </div>

        <div className="settings-hero-badge">
          <Settings2 size={19} />

          <div>
            <span>Status Sistem</span>
            <strong>Terhubung</strong>
          </div>
        </div>
      </section>

      <section className="settings-info-grid">
        <div className="settings-info-card">
          <div className="settings-info-icon">
            <ShieldCheck size={19} />
          </div>

          <div>
            <span>ROLE</span>
            <strong>3 Role Aktif</strong>
            <small>
              Admin, Sekretaris, Bendahara
            </small>
          </div>
        </div>

        <div className="settings-info-card">
          <div className="settings-info-icon">
            <Users size={19} />
          </div>

          <div>
            <span>AKSES</span>
            <strong>Berbasis Role</strong>
            <small>
              Hak akses dikontrol sistem
            </small>
          </div>
        </div>

        <div className="settings-info-card">
          <div className="settings-info-icon">
            <Database size={19} />
          </div>

          <div>
            <span>DATABASE</span>
            <strong>Google Sheets</strong>
            <small>
              Data aplikasi tersentralisasi
            </small>
          </div>
        </div>

        <div className="settings-info-card">
          <div className="settings-info-icon">
            <Gavel size={19} />
          </div>

          <div>
            <span>ATURAN</span>
            <strong>Terpusat</strong>
            <small>
              Konfigurasi aturan denda
            </small>
          </div>
        </div>
      </section>

      <section className="settings-grid">
        <SettingCard
          icon={Users}
          title="Manajemen Pengguna"
          description="Kelola akun dan peran pengguna sistem."
          status="MODUL ADMINISTRASI"
          tone="blue"
        >
          <div className="settings-feature-list">
            <div>
              <strong>Admin</strong>
              <span>Akses penuh sistem</span>
            </div>
            <div>
              <strong>Sekretaris</strong>
              <span>Kegiatan, absensi, anggota</span>
            </div>
            <div>
              <strong>Bendahara</strong>
              <span>Kas dan keuangan</span>
            </div>
          </div>

          <div className="settings-coming-soon">
            Modul manajemen pengguna
            siap dikembangkan pada tahap
            berikutnya.
          </div>
        </SettingCard>

        <SettingCard
          icon={Gavel}
          title="Aturan Denda"
          description="Kelola besaran denda berdasarkan kondisi absensi."
          status="ATURAN KEUANGAN"
          tone="red"
        >
          <div className="settings-rule-list">
            <div>
              <span>ALPHA</span>
              <strong>
                Aturan tersimpan di sistem
              </strong>
            </div>

            <div>
              <span>IZIN</span>
              <strong>
                Aturan tersimpan di sistem
              </strong>
            </div>

            <div>
              <span>SAKIT</span>
              <strong>
                Aturan tersimpan di sistem
              </strong>
            </div>
          </div>

          <div className="settings-coming-soon">
            Editor aturan denda akan
            dihubungkan langsung ke
            konfigurasi sistem.
          </div>
        </SettingCard>

        <SettingCard
          icon={KeyRound}
          title="Keamanan Akses"
          description="Ringkasan mekanisme proteksi akses aplikasi."
          status="KEAMANAN"
          tone="green"
        >
          <div className="settings-security-list">
            <div>
              <ShieldCheck size={16} />
              <span>Role validation</span>
              <b>AKTIF</b>
            </div>

            <div>
              <ShieldCheck size={16} />
              <span>Session validation</span>
              <b>AKTIF</b>
            </div>

            <div>
              <ShieldCheck size={16} />
              <span>Protected routes</span>
              <b>AKTIF</b>
            </div>
          </div>
        </SettingCard>

        <SettingCard
          icon={Database}
          title="Konfigurasi Database"
          description="Informasi sumber data utama aplikasi."
          status="INFRASTRUKTUR"
          tone="neutral"
        >
          <div className="settings-database">
            <div>
              <span>Database</span>
              <strong>Google Sheets</strong>
            </div>

            <div>
              <span>API</span>
              <strong>Google Apps Script</strong>
            </div>

            <div>
              <span>Frontend</span>
              <strong>React + Vite</strong>
            </div>
          </div>
        </SettingCard>
      </section>

      <section className="settings-note">
        <Settings2 size={17} />

        <div>
          <strong>
            Pengaturan lanjutan
          </strong>

          <span>
            Modul ini sekarang menjadi
            pusat konfigurasi Admin.
            Fitur manajemen pengguna
            dan editor aturan dapat
            ditambahkan tanpa mengubah
            halaman keuangan dan
            sekretaris yang sudah PASS.
          </span>
        </div>
      </section>
    </div>
  );
}