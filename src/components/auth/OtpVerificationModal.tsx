import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, KeyRound, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void;
  onBackToRegister?: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  onSuccess,
  onBackToRegister,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const { verifyOtp, resendOtp, isSupabaseConnected } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setCountdown(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      isVerifyingRef.current = false;
      setTimeout(() => inputRefs.current[0]?.focus(), 100);

      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, email]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) return;

    // Prevent duplicate simultaneous requests
    if (isVerifyingRef.current || loading) return;
    isVerifyingRef.current = true;
    setLoading(true);

    try {
      // Exactly ONE request to verifyOtp
      await verifyOtp(email, token);
      onSuccess();
      onClose();
    } catch {
      // Re-enable button on error
      isVerifyingRef.current = false;
    } finally {
      setLoading(false);
      isVerifyingRef.current = false;
    }
  };

  const handleResend = async () => {
    if (!canResend || resending || loading) return;
    setResending(true);
    try {
      // Exactly ONE request to resendOtp
      await resendOtp(email);
      setCountdown(30);
      setCanResend(false);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      // Error handled in AuthContext
    } finally {
      setResending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center py-2">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF9EE] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] flex items-center justify-center mx-auto mb-4 border border-[#F8E0B0] dark:border-[#5C4212] shadow-sm">
          <KeyRound className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-[#1A202C] dark:text-white mb-1.5">
          Verify Your Email
        </h3>
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mb-5 max-w-xs mx-auto">
          We&apos;ve sent a 6-digit OTP verification code to <span className="font-bold text-[#8C5D0B] dark:text-[#E9B949]">{email}</span>
        </p>

        {!isSupabaseConnected && (
          <div className="mb-4 p-3 rounded-xl bg-[#FEF6E9] dark:bg-[#2C210C]/60 border border-[#F8E0B0] dark:border-[#5C4212] text-[#8C5D0B] dark:text-[#E9B949] text-xs leading-relaxed">
            💡 <strong>Demo Mode</strong>: Enter any 6-digit code (e.g. <code>123456</code>) to complete verification!
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                disabled={loading}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949] transition-all disabled:opacity-60"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={otp.join('').length !== 6 || loading}
            className="w-full py-3 px-4 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] disabled:opacity-50 disabled:cursor-not-allowed text-[#1A202C] font-bold text-xs shadow-sm transition-all mb-4 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Code...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Verify & Proceed
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-[#718096] dark:text-[#A0AEC0] pt-2 border-t border-[#EFE6D5] dark:border-[#2C323F]">
          {onBackToRegister ? (
            <button
              onClick={onBackToRegister}
              disabled={loading}
              className="hover:text-[#1A202C] dark:hover:text-white flex items-center gap-1 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          <div>
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resending || loading}
                className="text-[#8C5D0B] dark:text-[#E9B949] hover:underline font-bold flex items-center gap-1"
              >
                {resending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                Resend OTP
              </button>
            ) : (
              <span>Resend OTP in <span className="font-mono text-[#8C5D0B] dark:text-[#E9B949] font-bold">{countdown}s</span></span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
