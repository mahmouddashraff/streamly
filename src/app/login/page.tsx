"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/I18nProvider";
type ViewState = 'sign_in' | 'sign_up' | 'forgot_email' | 'forgot_verify' | 'forgot_reset';

function LoginContent() {
  const [view, setView] = useState<ViewState>('sign_in');
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { t } = useI18n();

  const handleSignInUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || (view === 'sign_up' && !confirmPassword)) {
      setError(t("requiredFields"));
      setLoading(false);
      return;
    }

    if (view === 'sign_up' && password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setLoading(false);
      return;
    }
    
    const supabase = createClient();
    
    if (view === 'sign_up') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        await fetch('/api/notify-login', { method: 'POST' }).catch(() => {});
        router.push(redirectUrl);
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        await fetch('/api/notify-login', { method: 'POST' }).catch(() => {});
        router.push(redirectUrl);
        router.refresh();
      }
    }
    
    setLoading(false);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t("requiredFields"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/forgot-password-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      
      setSuccessMsg(t("checkEmailForCode"));
      setView('forgot_verify');
    } catch (err: any) {
      setError(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError(t("requiredFields"));
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/users/verify-reset-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      
      setView('forgot_reset');
    } catch (err: any) {
      setError(err.message === "Invalid PIN" ? t("invalidPin") : 
               err.message === "Too many attempts" ? t("tooManyAttempts") : 
               err.message === "Code expired or invalid" ? t("pinExpired") :
               err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError(t("requiredFields"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/reset-password-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      
      setSuccessMsg(t("passwordResetSuccess"));
      setPassword("");
      setConfirmPassword("");
      setCode("");
      setView('sign_in');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAndGoTo = (v: ViewState) => {
    setError(null);
    setSuccessMsg(null);
    if (v === 'sign_in' || v === 'sign_up') {
      setPassword("");
      setConfirmPassword("");
      setCode("");
    }
    setView(v);
  };

  // Rendering logic based on view
  return (
    <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative z-10">
      <h1 className="text-2xl font-bold text-center mb-8 text-white">
        {view === 'sign_up' && t("signUp")}
        {view === 'sign_in' && t("signIn")}
        {view === 'forgot_email' && t("forgotPassword")}
        {view === 'forgot_verify' && t("verifyCode")}
        {view === 'forgot_reset' && t("createNewPassword")}
      </h1>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-100 text-sm p-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {successMsg && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-100 text-sm p-3 rounded-lg mb-6">
          {successMsg}
        </div>
      )}

      {(view === 'sign_in' || view === 'sign_up') && (
        <form onSubmit={handleSignInUp} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t("email")}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              dir="ltr"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t("password")}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              dir="ltr"
            />
          </div>

          {view === 'sign_up' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">{t("confirmPassword")}</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                dir="ltr"
              />
            </div>
          )}

          {view === 'sign_in' && (
            <div className="text-end">
              <button type="button" onClick={() => clearAndGoTo('forgot_email')} className="text-xs text-gray-400 hover:text-white transition-colors">
                {t("forgotPassword")}
              </button>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 mt-2"
          >
            {loading 
              ? (view === 'sign_up' ? t("signingUp") : t("signingIn")) 
              : (view === 'sign_up' ? t("signUp") : t("signIn"))}
          </button>
        </form>
      )}

      {view === 'forgot_email' && (
        <form onSubmit={handleSendCode} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t("email")}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              dir="ltr"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? t("processing") : t("sendVerificationCode")}
          </button>
          <div className="text-center mt-4">
             <button type="button" onClick={() => clearAndGoTo('sign_in')} className="text-sm text-gray-400 hover:text-white transition-colors">
               {t("signIn")}
             </button>
          </div>
        </form>
      )}

      {view === 'forgot_verify' && (
        <form onSubmit={handleVerifyCode} className="space-y-5">
          <p className="text-sm text-gray-300 text-center mb-4">{t("enterCodeSent")}</p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">PIN</label>
            <input 
              type="text" 
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors tracking-[0.5em] text-center text-xl font-mono"
              dir="ltr"
            />
          </div>
          <button 
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? t("processing") : t("verifyCodeBtn")}
          </button>
          <div className="flex justify-between items-center mt-4 px-2">
            <button type="button" onClick={() => clearAndGoTo('sign_in')} className="text-sm text-gray-400 hover:text-white transition-colors">
               {t("signIn")}
             </button>
             <button type="button" onClick={handleSendCode} disabled={loading} className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50">
               {t("resendCode")}
             </button>
          </div>
        </form>
      )}

      {view === 'forgot_reset' && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t("newPassword")}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t("confirmPassword")}</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              dir="ltr"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? t("processing") : t("resetPassword")}
          </button>
          <div className="text-center mt-4">
             <button type="button" onClick={() => clearAndGoTo('sign_in')} className="text-sm text-gray-400 hover:text-white transition-colors">
               {t("signIn")}
             </button>
          </div>
        </form>
      )}

      {(view === 'sign_in' || view === 'sign_up') && (
        <div className="mt-8 text-center">
          <button 
            onClick={() => clearAndGoTo(view === 'sign_in' ? 'sign_up' : 'sign_in')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {view === 'sign_up' ? t("haveAccount") : t("noAccount")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-0" />
      <Suspense fallback={<div className="w-full max-w-md text-center text-white relative z-10">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
