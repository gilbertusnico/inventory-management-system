// Entry point for the Inventory Management System
import './style.css';
import { Clerk } from '@clerk/clerk-js';
import { initializeData, setAuthTokenProvider } from './data.js';

type ClerkLoadOptions = NonNullable<Parameters<Clerk['load']>[0]>;
type ClerkUIConstructor = NonNullable<NonNullable<ClerkLoadOptions['ui']>['ClerkUI']>;

declare global {
  interface Window {
    __internal_ClerkUICtor?: ClerkUIConstructor;
  }
}

let appStarted = false;
let startPromise = null;
let signInMount: HTMLDivElement | null = null;

async function loadClerkUI(publishableKey: string) {
  const encodedDomain = publishableKey.split('_')[2];
  if (!encodedDomain) throw new Error('Format VITE_CLERK_PUBLISHABLE_KEY tidak valid');

  let clerkDomain: string;
  try {
    clerkDomain = atob(encodedDomain).replace(/\$$/, '');
  } catch {
    throw new Error('Domain pada VITE_CLERK_PUBLISHABLE_KEY tidak valid');
  }

  await new Promise<void>(function(resolve, reject) {
    const script = document.createElement('script');
    script.src = 'https://' + clerkDomain + '/npm/@clerk/ui@1/dist/ui.browser.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = function() {
      if (window.__internal_ClerkUICtor) resolve();
      else reject(new Error('Clerk UI berhasil dimuat tetapi komponennya tidak tersedia'));
    };
    script.onerror = function() {
      reject(new Error('Gagal memuat komponen UI Clerk'));
    };
    document.head.appendChild(script);
  });
}

function showMessage(title: string, message: string, buttonText?: string, onRetry?: () => void) {
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = '<main style="max-width:520px;margin:15vh auto;padding:24px;font:14px system-ui;color:#0f172a">' +
    '<h1 style="font-size:20px">' + title + '</h1>' +
    '<p style="color:#475569">' + message + '</p>' +
    (buttonText ? '<button id="retryStartup" style="padding:9px 14px;cursor:pointer">' + buttonText + '</button>' : '') +
    '</main>';
  if (onRetry) document.getElementById('retryStartup')?.addEventListener('click', onRetry);
}

function showSignIn(clerk: Clerk) {
  const root = document.getElementById('root');
  if (!root || signInMount) return;
  document.body.classList.add('clerk-auth-page');
  root.classList.add('clerk-sign-in-root');
  root.replaceChildren();
  signInMount = document.createElement('div');
  root.appendChild(signInMount);
  clerk.mountSignIn(signInMount, {
    fallbackRedirectUrl: window.location.href,
    withSignUp: false,
    appearance: {
      variables: {
        colorBackground: '#ffffff',
        colorForeground: '#0f172a',
        colorMutedForeground: '#64748b',
        colorPrimary: '#2563eb',
        colorPrimaryForeground: '#ffffff',
        colorInput: '#f8fafc',
        colorInputForeground: '#0f172a',
        colorBorder: '#dbe4f0',
        colorRing: '#3b82f6',
        colorShadow: '#020617',
        borderRadius: '14px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
    },
  });
}

async function startApp(clerk: Clerk) {
  if (appStarted) return;
  if (startPromise) return startPromise;
  const root = document.getElementById('root');
  if (signInMount) {
    clerk.unmountSignIn(signInMount);
    signInMount = null;
  }
  document.body.classList.remove('clerk-auth-page');
  root?.classList.remove('clerk-sign-in-root');
  startPromise = (async function() {
    try {
      await initializeData();
      await import('./app.js');
      const userButton = document.getElementById('clerkUserButton');
      const userName = document.getElementById('clerkUserName');
      if (userName) {
        userName.textContent = clerk.user?.fullName ||
          clerk.user?.primaryEmailAddress?.emailAddress ||
          'Pengguna';
      }
      if (userButton) clerk.mountUserButton(userButton);
      appStarted = true;
    } catch (error) {
      console.error('Gagal memuat data dari database:', error);
      showMessage(
        'Aplikasi tidak dapat dimuat',
        'Pastikan API berjalan serta DATABASE_URL dan CLERK_SECRET_KEY sudah dikonfigurasi di server. Data lokal tidak digunakan sebagai pengganti database.',
        'Coba lagi',
        function() {
          startPromise = null;
          startApp(clerk);
        },
      );
    }
    return root;
  })();
  return startPromise;
}

async function start() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    showMessage(
      'Autentikasi belum dikonfigurasi',
      'Tambahkan VITE_CLERK_PUBLISHABLE_KEY ke environment lokal atau Vercel, lalu muat ulang aplikasi.',
    );
    return;
  }

  try {
    await loadClerkUI(publishableKey);
    const clerk = new Clerk(publishableKey);
    await clerk.load({
      ui: { ClerkUI: window.__internal_ClerkUICtor },
      afterSignOutUrl: window.location.origin + '/',
    });
    setAuthTokenProvider(function() {
      return clerk.session?.getToken() ?? null;
    });

    let wasSignedIn = Boolean(clerk.isSignedIn);
    if (wasSignedIn) await startApp(clerk);
    else showSignIn(clerk);

    clerk.addListener(function({ user }) {
      if (user) {
        wasSignedIn = true;
        void startApp(clerk);
      } else if (wasSignedIn) {
        window.location.replace(window.location.origin + '/');
      } else {
        showSignIn(clerk);
      }
    });
  } catch (error) {
    console.error('Gagal menginisialisasi Clerk:', error);
    showMessage('Layanan login tidak dapat diakses', 'Periksa konfigurasi Clerk dan koneksi internet, lalu muat ulang halaman.');
  }
}

void start();
