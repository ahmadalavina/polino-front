'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  GraduationCap,
  Save,
  UserRound,
} from 'lucide-react';
import { api, type UserProfile } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

type ProfileForm = {
  firstName: string;
  lastName: string;
  birthDate: string;
  grade: string;
  avatarId: string;
};

const emptyForm: ProfileForm = {
  firstName: '',
  lastName: '',
  birthDate: '',
  grade: '',
  avatarId: '1',
};

function toForm(profile: UserProfile): ProfileForm {
  return {
    firstName: profile.firstName ?? profile.name?.split(' ')[0] ?? '',
    lastName: profile.lastName ?? profile.name?.split(' ').slice(1).join(' ') ?? '',
    birthDate: profile.birthDate ?? '',
    grade: profile.grade ? String(profile.grade) : '',
    avatarId: profile.avatarId ? String(profile.avatarId) : '1',
  };
}

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getMyProfile()
      .then((profile) => {
        if (active && profile) setForm(toForm(profile));
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'اطلاعات پروفایل دریافت نشد.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
    if (error) setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('لطفاً نام و نام خانوادگی را کامل وارد کن.');
      return;
    }

    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api.updateMyProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        birthDate: form.birthDate || undefined,
        grade: form.grade ? Number(form.grade) : undefined,
        avatarId: form.avatarId ? Number(form.avatarId) : undefined,
      });
      setSaved(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'ذخیره اطلاعات انجام نشد.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-background ps-4 pe-4 py-6 text-foreground sm:py-10"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -end-32 -top-32 size-80 rounded-full bg-info-soft" />
      <div className="pointer-events-none absolute -bottom-40 -start-32 size-96 rounded-full bg-brand-soft" />

      <div className="relative mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/course"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-surface ps-4 pe-4 py-2.5 text-sm font-black text-muted shadow-sm transition-colors hover:border-brand hover:text-brand"
          >
            <ArrowRight size={18} />
            بازگشت به دوره‌ها
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="grid size-12 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-[0_5px_0_var(--brand-strong)]">
              <UserRound size={25} />
            </div>
          </div>
        </div>
        <section className="rounded-[32px] border-2 border-border bg-surface/95 p-6 shadow-[0_20px_65px_rgba(38,61,89,0.12)] backdrop-blur sm:p-9">
          <div className="mb-8">
            <p className="mb-1 text-xs font-black text-success-soft-foreground">حساب کاربری من</p>
            <h1 className="text-2xl font-black leading-9 text-foreground sm:text-3xl">
              ویرایش اطلاعات پروفایل
            </h1>
            <p className="mt-2 text-sm font-medium leading-7 text-muted">
              اطلاعاتت را به‌روز کن تا تجربه یادگیری بهتری داشته باشی.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="h-14 animate-pulse rounded-2xl bg-surface-muted" />
              <div className="h-14 animate-pulse rounded-2xl bg-surface-muted" />
              <div className="h-14 animate-pulse rounded-2xl bg-surface-muted" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-muted">نام</span>
                  <input
                    value={form.firstName}
                    onChange={(event) => updateField('firstName', event.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-border bg-surface-muted ps-4 pe-4 font-bold outline-none transition focus:border-brand focus:bg-surface"
                    placeholder="مثلاً آوا"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-muted">
                    نام خانوادگی
                  </span>
                  <input
                    value={form.lastName}
                    onChange={(event) => updateField('lastName', event.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-border bg-surface-muted ps-4 pe-4 font-bold outline-none transition focus:border-brand focus:bg-surface"
                    placeholder="مثلاً محمدی"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-muted">
                    <CalendarDays size={17} className="text-accent" />
                    تاریخ تولد
                  </span>
                  <input
                    value={form.birthDate}
                    onChange={(event) => updateField('birthDate', event.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-border bg-surface-muted ps-4 pe-4 font-bold outline-none transition focus:border-brand focus:bg-surface"
                    placeholder="YYYY-MM-DD"
                    dir="ltr"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-muted">
                    <GraduationCap size={17} className="text-info" />
                    پایه تحصیلی
                  </span>
                  <select
                    value={form.grade}
                    onChange={(event) => updateField('grade', event.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-border bg-surface-muted ps-4 pe-4 font-bold outline-none transition focus:border-brand focus:bg-surface"
                  >
                    <option value="">انتخاب پایه</option>
                    {[1, 2, 3, 4, 5, 6].map((grade) => (
                      <option key={grade} value={grade}>
                        پایه {grade}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-muted">
                  شناسه آواتار
                </span>
                <input
                  type="number"
                  min={1}
                  value={form.avatarId}
                  onChange={(event) => updateField('avatarId', event.target.value)}
                  className="h-14 w-full rounded-2xl border-2 border-border bg-surface-muted ps-4 pe-4 font-bold outline-none transition focus:border-brand focus:bg-surface"
                />
              </label>

              {error && (
                <p className="rounded-2xl bg-danger-soft ps-4 pe-4 py-3 text-sm font-bold leading-6 text-danger">
                  {error}
                </p>
              )}
              {saved && (
                <p className="flex items-center gap-2 rounded-2xl bg-success-soft ps-4 pe-4 py-3 text-sm font-bold text-success-soft-foreground">
                  <Check size={18} />
                  اطلاعات پروفایل با موفقیت ذخیره شد.
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-success text-base font-black text-success-foreground shadow-[0_6px_0_var(--success-strong)] transition-all hover:bg-success-hover active:translate-y-1 active:shadow-[0_2px_0_var(--success-strong)] disabled:cursor-not-allowed disabled:bg-border-strong disabled:shadow-[0_6px_0_var(--border-strong)]"
              >
                <Save size={20} />
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
