import { LoaderCircle, Save } from 'lucide-react';

export function SubmitButton({
  loading,
  label,
}: {
  loading: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#58cc59] text-base font-black text-white shadow-[0_6px_0_#3da83e] transition-all hover:bg-[#61d562] active:translate-y-1 active:shadow-[0_2px_0_#3da83e] disabled:cursor-wait disabled:bg-slate-300 disabled:shadow-[0_6px_0_#cbd5e1]"
    >
      {loading ? (
        <LoaderCircle className="animate-spin" size={21} />
      ) : (
        <Save size={20} strokeWidth={3} />
      )}
      {loading ? 'در حال ذخیره...' : label}
    </button>
  );
}
