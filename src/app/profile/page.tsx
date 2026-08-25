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
      className="relative min-h-screen overflow-hidden bg-[#f5fbff] ps-4 pe-4 py-6 text-slate-800 sm:py-10"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -end-32 -top-32 size-80 rounded-full bg-[#ddf8ef]" />
      <div className="pointer-events-none absolute -bottom-40 -start-32 size-96 rounded-full bg-[#ece7ff]" />

      <div className="relative mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/course"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white ps-4 pe-4 py-2.5 text-sm font-black text-slate-600 shadow-sm transition-colors hover:border-[#7c5cff] hover:text-[#7c5cff]"
          >
            <ArrowRight size={18} />
            بازگشت به دوره‌ها
          </Link>
          <div className="grid size-12 place-items-center rounded-2xl bg-[#7c5cff] text-white shadow-[0_5px_0_#6245dc]">
            <UserRound size={25} />
          </div>
        </div>

        <section className="rounded-[32px] border-2 border-white bg-white/95 p-6 shadow-[0_20px_65px_rgba(38,61,89,0.12)] backdrop-blur sm:p-9">
          <div className="mb-8">
            <p className="mb-1 text-xs font-black text-[#58b759]">حساب کاربری من</p>
            <h1 className="text-2xl font-black leading-9 text-slate-800 sm:text-3xl">
              ویرایش اطلاعات پروفایل
            </h1>
            <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
              اطلاعاتت را به‌روز کن تا تجربه یادگیری بهتری داشته باشی.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-600">نام</span>
                  <input
                    value={form.firstName}
                    onChange={(event) => updateField('firstName', event.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 ps-4 pe-4 font-bold outline-none transition focus:border-[#7c5cff] focus:bg-white"
                    placeholder="مثلاً آوا"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-600">
                    نام خانوادگی
                  </span>
                  <input
                    value={form.lastName}
                    onChange={(event) => updateField('lastName', event.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 ps-4 pe-4 font-bold outline-none transition focus:border-[#7c5cff] focus:bg-white"
                    placeholder="مثلاً محمدی"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-600">
                    <CalendarDays size={17} className="text-[#ff8a55]" />
                    تاریخ تولد
                  </span>
                  <input
                    value={form.birthDate}
                    onChange={(event) => updateField('birthDate', event.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 ps-4 pe-4 font-bold outline-none transition focus:border-[#7c5cff] focus:bg-white"
                    placeholder="YYYY-MM-DD"
                    dir="ltr"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-600">
                    <GraduationCap size={17} className="text-[#16b8a6]" />
                    پایه تحصیلی
                  </span>
                  <select
                    value={form.grade}
                    onChange={(event) => updateField('grade', event.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 ps-4 pe-4 font-bold outline-none transition focus:border-[#7c5cff] focus:bg-white"
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
                <span className="mb-2 block text-sm font-bold text-slate-600">
                  شناسه آواتار
                </span>
                <input
                  type="number"
                  min={1}
                  value={form.avatarId}
                  onChange={(event) => updateField('avatarId', event.target.value)}
                  className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 ps-4 pe-4 font-bold outline-none transition focus:border-[#7c5cff] focus:bg-white"
                />
              </label>

              {error && (
                <p className="rounded-2xl bg-rose-50 ps-4 pe-4 py-3 text-sm font-bold leading-6 text-rose-500">
                  {error}
                </p>
              )}
              {saved && (
                <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 ps-4 pe-4 py-3 text-sm font-bold text-emerald-600">
                  <Check size={18} />
                  اطلاعات پروفایل با موفقیت ذخیره شد.
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#58cc59] text-base font-black text-white shadow-[0_6px_0_#3da83e] transition-all hover:bg-[#61d562] active:translate-y-1 active:shadow-[0_2px_0_#3da83e] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-[0_6px_0_#cbd5e1]"
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
