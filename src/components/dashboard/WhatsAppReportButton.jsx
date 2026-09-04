import React, { useState } from 'react';
import { Share2 } from 'lucide-react';

import { getApi } from '../../api';
import { buildFinanceReport } from '../../features/whatsapp/buildFinanceReport';

export default function WhatsAppReportButton({
  session,
  kas,
  denda,
}) {
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    if (!session?.userId || !session?.role) {
      return;
    }

    setBusy(true);

    try {
      const [kasRows, dendaRows] =
        await Promise.all([
          getApi('kas.list', {
            userId: session.userId,
            role: session.role,
          }),

          getApi('denda.list', {
            userId: session.userId,
            role: session.role,
          }),
        ]);

      const message =
        buildFinanceReport({
          kas,
          denda,
          kasRows: kasRows || [],
          dendaRows: dendaRows || [],
        });

      // =========================================
      // DEBUG
      // =========================================

      console.log(
        '===== LAPORAN WA ====='
      );

      console.log(message);

      console.log(
        'Emoji / Unicode:',
        [...message]
          .filter(
            (char) =>
              char.codePointAt(0) > 127
          )
          .map((char) => ({
            char,
            codePoint:
              'U+' +
              char
                .codePointAt(0)
                .toString(16)
                .toUpperCase(),
          }))
      );

      // =========================================
      // WHATSAPP
      // =========================================

      const encodedMessage =
        encodeURIComponent(message);

      const url =
        `https://api.whatsapp.com/send?text=${encodedMessage}`;

      console.log(
        'Encoded URL:',
        url
      );

      window.open(
        url,
        '_blank',
        'noopener,noreferrer'
      );

    } catch (error) {
      console.error(
        'Gagal menyiapkan laporan WhatsApp:',
        error
      );

      window.alert(
        error?.message ||
          'Laporan WhatsApp gagal disiapkan. Coba lagi.'
      );

    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="finance-whatsapp-btn"
      onClick={handleShare}
      disabled={busy}
      aria-label="Bagikan laporan ke WhatsApp"
    >
      <Share2 size={17} />
      {busy
        ? 'Menyiapkan...'
        : 'Bagikan Laporan'}
    </button>
  );
}