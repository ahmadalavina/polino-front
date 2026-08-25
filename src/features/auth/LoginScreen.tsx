'use client';

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  KeyRound,
  MessageCircleMore,
  Pencil,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { api, ApiError, VerifyOtpResponse } from '@/lib/api';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function unwrapAuthResponse(response: VerifyOtpResponse) {
  const payload = response.data ?? response;
  return {
    accessToken:
      payload.accessToken ?? payload.access_token ?? payload.token ?? '',
    refreshToken: payload.refreshToken ?? payload.refresh_token ?? '',
  };
}

const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

const normalizeDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)));

const phoneSchema = z
  .string()
  .transform((value) => normalizeDigits(value).replace(/\D/g, ''))
  .refine((value) => /^09\d{9}$/.test(value), {
    message: 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم داشته باشد.',
  });

type LoginStep = 'phone' | 'otp' | 'success';

function BrandMark() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative grid size-12 place-items-center rounded-2xl bg-[#ffd84d] text-2xl shadow-[0_5px_0_#e9ad24]">
        <span aria-hidden="true">🪙</span>
        <Sparkles
          aria-hidden="true"
          className="absolute -end-2 -top-2 fill-[#7c5cff] text-[#7c5cff]"
          size={18}
        />
      </div>
      <div>
        <p className="text-2xl font-black leading-8 text-slate-800">پولینو</p>
        <p className="text-[11px] font-bold text-slate-400">
          دنیای قهرمان‌های پول‌بلد
        </p>
      </div>
    </div>
  );
}

function MascotBubble({ step }: { step: LoginStep }) {
  const message =
    step === 'phone'
      ? 'سلام! شماره موبایلت رو بزن تا وارد دنیای پولینو بشی.'
      : step === 'otp'
        ? 'یه پیامک برات فرستادم؛ کدش رو اینجا وارد کن!'
        : 'آفرین! آماده‌ای با هم پول‌بلدتر بشیم؟';

  return (
    <div className="relative mx-auto mb-6 flex max-w-sm items-end justify-center gap-3">
      <div className="relative max-w-56 rounded-[20px] border-2 border-slate-100 bg-white px-4 py-3 text-sm font-bold leading-6 text-slate-600 shadow-sm">
        <span className="absolute -end-2 bottom-5 size-4 rotate-45 border-e-2 border-t-2 border-slate-100 bg-white" />
        {message}
      </div>
      <div className="relative grid size-20 shrink-0 place-items-center rounded-[28px] bg-gradient-to-br from-[#73df75] to-[#43bb54] shadow-[0_7px_0_#2f963c]">
        <span className="text-4xl drop-shadow-sm" aria-hidden="true">
          🐢
        </span>
        <span className="absolute -bottom-1 -start-1 grid size-7 place-items-center rounded-full border-2 border-white bg-[#ffd84d] text-sm">
          🪙
        </span>
      </div>
    </div>
  );
}

function StepDots({ step }: { step: LoginStep }) {
  const activeStep = step === 'phone' ? 0 : 1;

  return (
    <div
      className="mb-5 flex items-center justify-center gap-2"
      aria-label={`مرحله ${activeStep + 1} از ۲`}
    >
      {[0, 1].map((index) => (
        <span
          key={index}
          className={`h-2.5 rounded-full transition-all ${
            index === activeStep ? 'w-8 bg-[#58cc59]' : 'w-2.5 bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

function PhoneStep({
  phone,
  error,
  onPhoneChange,
  onSubmit,
}: {
  phone: string;
  error: string;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-[#eeeaff] text-[#7458e8]">
          <Phone size={27} strokeWidth={2.7} />
        </div>
        <h1 className="text-2xl font-black leading-9 text-slate-800">
          ورود به پولینو
        </h1>
        <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
          شماره موبایل خودت یا یکی از والدینت رو وارد کن.
        </p>
      </div>

      <label htmlFor="mobile" className="mb-2 block text-sm font-bold text-slate-600">
        شماره موبایل
      </label>
      <div className="relative">
        <input
          id="mobile"
          name="mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          autoFocus
          dir="ltr"
          value={phone}
          maxLength={11}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder="0912 345 6789"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'mobile-error' : 'mobile-help'}
          className={`h-16 w-full rounded-2xl border-2 bg-slate-50 px-14 text-center text-xl font-black tracking-[0.12em] text-slate-800 outline-none transition-all placeholder:text-base placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-300 focus:bg-white ${
            error
              ? 'border-rose-300 focus:border-rose-400 focus:shadow-[0_0_0_4px_rgba(251,113,133,0.12)]'
              : 'border-slate-200 focus:border-[#7c5cff] focus:shadow-[0_0_0_4px_rgba(124,92,255,0.12)]'
          }`}
        />
        <Phone
          aria-hidden="true"
          className="absolute start-5 top-1/2 -translate-y-1/2 text-slate-400"
          size={21}
        />
        <span
          className="absolute end-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400"
          dir="ltr"
        >
          +98
        </span>
      </div>

      {error ? (
        <p id="mobile-error" className="mt-2 text-xs font-bold leading-6 text-rose-500">
          {error}
        </p>
      ) : (
        <p
          id="mobile-help"
          className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400"
        >
          <ShieldCheck size={15} className="text-[#58cc59]" />
          شماره شما نزد پولینو امن می‌مونه.
        </p>
      )}

      <button
        type="submit"
        className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#58cc59] text-base font-black text-white shadow-[0_6px_0_#3d9e42] transition-all hover:bg-[#61d562] active:translate-y-1 active:shadow-[0_2px_0_#3d9e42]"
      >
        دریافت کد ورود
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </form>
  );
}

function OtpStep({
  phone,
  otp,
  error,
  secondsLeft,
  onOtpChange,
  onEditPhone,
  onResend,
  onSubmit,
}: {
  phone: string;
  otp: string[];
  error: string;
  secondsLeft: number;
  onOtpChange: (index: number, value: string) => void;
  onEditPhone: () => void;
  onResend: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowLeft' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedCode = normalizeDigits(event.clipboardData.getData('text'))
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);

    if (!pastedCode) return;

    event.preventDefault();
    pastedCode.split('').forEach((digit, index) => onOtpChange(index, digit));
    inputRefs.current[Math.min(pastedCode.length, OTP_LENGTH) - 1]?.focus();
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-[#fff2d8] text-[#e59a19]">
          <MessageCircleMore size={28} strokeWidth={2.6} />
        </div>
        <h1 className="text-2xl font-black leading-9 text-slate-800">
          کد ورود رو بنویس
        </h1>
        <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
          کد ۶ رقمی به این شماره پیامک شد:
        </p>
        <div className="mt-1 flex items-center justify-center gap-2">
          <b className="text-sm text-slate-700" dir="ltr">
            {phone}
          </b>
          <button
            type="button"
            onClick={onEditPhone}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#7458e8] hover:text-[#5e43cf]"
          >
            <Pencil size={13} />
            ویرایش
          </button>
        </div>
      </div>

      <div
        className="flex justify-center gap-2"
        dir="ltr"
        role="group"
        aria-label="کد ورود شش رقمی"
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            value={digit}
            maxLength={1}
            onPaste={handlePaste}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onChange={(event) => {
              const normalizedValue = normalizeDigits(event.target.value).replace(
                /\D/g,
                '',
              );
              const nextDigit = normalizedValue.slice(-1);
              onOtpChange(index, nextDigit);
              if (nextDigit && index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
              }
            }}
            aria-label={`رقم ${index + 1}`}
            aria-invalid={Boolean(error)}
            className={`size-12 rounded-xl border-2 bg-slate-50 text-center text-2xl font-black text-slate-800 outline-none transition-all sm:size-14 ${
              error
                ? 'border-rose-300 focus:border-rose-400'
                : digit
                  ? 'border-[#7c5cff] bg-[#f7f5ff]'
                  : 'border-slate-200 focus:border-[#7c5cff] focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,255,0.12)]'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="mt-3 text-center text-xs font-bold leading-6 text-rose-500">
          {error}
        </p>
      )}

      <div className="mt-5 flex min-h-6 items-center justify-center text-xs font-bold">
        {secondsLeft > 0 ? (
          <p className="flex items-center gap-1.5 text-slate-400">
            <Clock3 size={15} />
            ارسال دوباره کد تا
            <span className="text-slate-600" dir="ltr">
              ۰۰:{secondsLeft.toLocaleString('fa-IR', {
                minimumIntegerDigits: 2,
                useGrouping: false,
              })}
            </span>
          </p>
        ) : (
          <button
            type="button"
            onClick={onResend}
            className="font-black text-[#7458e8] hover:text-[#5e43cf]"
          >
            ارسال دوباره کد
          </button>
        )}
      </div>

      <button
        type="submit"
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#58cc59] text-base font-black text-white shadow-[0_6px_0_#3d9e42] transition-all hover:bg-[#61d562] active:translate-y-1 active:shadow-[0_2px_0_#3d9e42]"
      >
        ورود به پولینو
        <KeyRound size={20} strokeWidth={2.8} />
      </button>

      <p className="mt-4 text-center text-[11px] font-medium leading-5 text-slate-400">
        کد ارسال‌شده را دقیق وارد کن.
      </p>
    </form>
  );
}

function SuccessStep({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="py-3 text-center">
      <div className="relative mx-auto mb-6 grid size-24 place-items-center rounded-full bg-[#e9fbe9]">
        <div className="grid size-16 place-items-center rounded-full bg-[#58cc59] text-white shadow-[0_6px_0_#3d9e42]">
          <Check size={35} strokeWidth={4} />
        </div>
        <Sparkles
          className="absolute -end-1 top-1 fill-[#ffd84d] text-[#eeb82b]"
          size={25}
        />
      </div>
      <h1 className="text-2xl font-black leading-9 text-slate-800">
        خوش اومدی قهرمان!
      </h1>
      <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-7 text-slate-500">
        ورودت با موفقیت انجام شد. حالا وقتشه مأموریت‌های پولینو رو شروع کنی.
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#7c5cff] text-base font-black text-white shadow-[0_6px_0_#5d43c9] transition-all hover:bg-[#8567ff] active:translate-y-1 active:shadow-[0_2px_0_#5d43c9]"
      >
        شروع ماجراجویی
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </div>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, secondsLeft]);

  const handlePhoneChange = (value: string) => {
    const normalizedPhone = normalizeDigits(value).replace(/\D/g, '').slice(0, 11);
    setPhone(normalizedPhone);
    if (phoneError) setPhoneError('');
  };

  const handlePhoneSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    const result = phoneSchema.safeParse(phone);

    if (!result.success) {
      setPhoneError(result.error.issues[0]?.message ?? 'شماره موبایل معتبر نیست.');
      return;
    }

    setIsLoading(true);
    setPhoneError('');
    try {
      await api.requestOtp({ mobileNumber: result.data });
      setPhone(result.data);
      setOtp(Array(OTP_LENGTH).fill(''));
      setOtpError('');
      setSecondsLeft(RESEND_SECONDS);
      setStep('otp');
    } catch (error) {
      setPhoneError(
        error instanceof Error ? error.message : 'Ø§Ø±Ø³Ø§Ù„ Ú©Ø¯ ÙˆØ±ÙˆØ¯ Ù†Ø§Ù…ÙˆÙÙ‚ Ø¨ÙˆØ¯.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    setOtp((currentOtp) =>
      currentOtp.map((digit, digitIndex) => (digitIndex === index ? value : digit)),
    );
    if (otpError) setOtpError('');
  };

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    if (otp.join('').length !== OTP_LENGTH) {
      setOtpError('لطفاً کد ۶ رقمی پیامک‌ شده را کامل وارد کن.');
      return;
    }

    setIsLoading(true);
    setOtpError('');
    try {
      const response = await api.verifyOtp({
        mobileNumber: phone,
        otp: otp.join(''),
      });
      const payload = unwrapAuthResponse(response);
      if (!payload.accessToken || !payload.refreshToken) {
        throw new Error(
          'ØªÙˆÚ©Ù†â€ŒÙ‡Ø§ÛŒ ÙˆØ±ÙˆØ¯ Ø§Ø² Ø³Ø±ÙˆÛŒØ³ Ø¯Ø±ÛŒØ§ÙØª Ù†Ø´Ø¯.',
        );
      }
      localStorage.setItem('token', payload.accessToken);
      localStorage.setItem('refreshToken', payload.refreshToken);
      try {
        const profile = await api.getMyProfile();
        const hasProfile =
          profile &&
          typeof profile === 'object' &&
          Boolean(
            (profile as Record<string, unknown>).nickname ||
              (profile as Record<string, unknown>).firstName ||
              (profile as Record<string, unknown>).name ||
              (profile as Record<string, unknown>).grade ||
              (profile as Record<string, unknown>).avatarId,
          );

        router.replace(hasProfile ? '/course' : '/');
      } catch (profileError) {
        if (profileError instanceof ApiError && profileError.status === 404) {
          router.replace('/');
          return;
        }

        throw profileError;
      }
    } catch (error) {
      setOtpError(
        error instanceof Error ? error.message : 'Ú©Ø¯ ÙˆØ±ÙˆØ¯ Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPhone = () => {
    setStep('phone');
    setOtpError('');
  };

  const handleResend = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setOtpError('');
    try {
      await api.requestOtp({ mobileNumber: phone });
      setOtp(Array(OTP_LENGTH).fill(''));
      setSecondsLeft(RESEND_SECONDS);
    } catch (error) {
      setOtpError(
        error instanceof Error ? error.message : 'Ø§Ø±Ø³Ø§Ù„ Ø¯ÙˆØ¨Ø§Ø±Ù‡ Ú©Ø¯ Ù†Ø§Ù…ÙˆÙÙ‚ Ø¨ÙˆØ¯.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setStep('phone');
    setPhone('');
    setOtp(Array(OTP_LENGTH).fill(''));
    setPhoneError('');
    setOtpError('');
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#f6fbff] px-4 py-6 text-slate-800 sm:items-center sm:py-10">
      <div className="pointer-events-none absolute -end-28 -top-32 size-80 rounded-full bg-[#dff8ee]" />
      <div className="pointer-events-none absolute -bottom-36 -start-32 size-96 rounded-full bg-[#ece8ff]" />
      <div className="pointer-events-none absolute end-[12%] top-[23%] hidden size-5 rotate-12 rounded-md bg-[#ffd84d] lg:block" />
      <div className="pointer-events-none absolute start-[14%] top-[64%] hidden size-6 rotate-45 rounded-lg bg-[#ff9870]/50 lg:block" />

      <div className="relative mx-auto w-full max-w-md">
        {step !== 'success' && (
          <button
            type="button"
            onClick={step === 'otp' ? handleEditPhone : undefined}
            aria-label={step === 'otp' ? 'بازگشت به مرحله شماره موبایل' : 'بازگشت'}
            className={`absolute start-0 top-1 grid size-10 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-700 ${
              step === 'phone' ? 'invisible' : ''
            }`}
          >
            <ChevronRight size={22} strokeWidth={3} />
          </button>
        )}

        <div className="mb-6 pt-1">
          <BrandMark />
        </div>

        <MascotBubble step={step} />

        <section className="rounded-[30px] border-2 border-white bg-white/95 p-5 shadow-[0_20px_65px_rgba(48,68,95,0.13)] backdrop-blur sm:p-8">
          {step !== 'success' && <StepDots step={step} />}

          {step === 'phone' && (
            <PhoneStep
              phone={phone}
              error={phoneError}
              onPhoneChange={handlePhoneChange}
              onSubmit={handlePhoneSubmit}
            />
          )}

          {step === 'otp' && (
            <OtpStep
              phone={phone}
              otp={otp}
              error={otpError}
              secondsLeft={secondsLeft}
              onOtpChange={handleOtpChange}
              onEditPhone={handleEditPhone}
              onResend={handleResend}
              onSubmit={handleOtpSubmit}
            />
          )}

          {step === 'success' && <SuccessStep onRestart={handleRestart} />}
        </section>

        <p className="mt-5 text-center text-xs font-bold leading-6 text-slate-400">
          با ورود به پولینو، قوانین استفاده و حریم خصوصی را می‌پذیری.
        </p>
      </div>
    </main>
  );
}
