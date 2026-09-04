import React, {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  ShieldCheck,
} from 'lucide-react';

import { getApi } from '../api';

import {
  saveSession,
} from '../auth';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setError('');

    try {
      const result = await getApi(
        'login',
        {
          username: form.username,
          password: form.password,
        }
      );

      saveSession(result);

      navigate(
        '/dashboard',
        {
          replace: true,
        }
      );
    } catch (err) {
      setError(
        err.message ||
        'Login gagal.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">

        <div className="login-logo-wrap">
          <img
            src="/login-logo-pmr-smanel.jpg"
            alt="Logo PMR SMANEL"
            className="login-logo-image"
            onError={(event) => {
              event.currentTarget.style.display = 'none';

              if (
                event.currentTarget.nextElementSibling
              ) {
                event.currentTarget
                  .nextElementSibling
                  .style.display = 'grid';
              }
            }}
          />

          <div className="login-logo-fallback">
            PMR
          </div>
        </div>

        <div className="eyebrow">
          PMR SMAN 1 AIKMEL
        </div>

        <h1>
          Masuk ke Sistem
        </h1>

        <p>
          Kelola absensi, denda,
          kas, pembayaran, dan
          laporan dalam satu tempat.
        </p>

        <form
          onSubmit={submit}
          className="stack"
        >
          <label>
            Username

            <input
              autoComplete="username"
              value={form.username}
              onChange={(event) =>
                setForm({
                  ...form,
                  username:
                    event.target.value,
                })
              }
            />
          </label>

          <label>
            Password

            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password:
                    event.target.value,
                })
              }
            />
          </label>

          {error && (
            <div className="alert error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-btn"
            disabled={busy}
          >
            {busy
              ? 'Memproses…'
              : 'Masuk'}
          </button>
        </form>

        <div className="login-note">
          <ShieldCheck size={16} />

          3 role: Admin Utama,
          Sekretaris, Bendahara
        </div>

      </div>
    </div>
  );
}