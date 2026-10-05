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
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-success text-base font-black text-success-foreground shadow-[0_6px_0_var(--success-strong)] transition-all hover:bg-success-hover active:translate-y-1 active:shadow-[0_2px_0_var(--success-strong)] disabled:cursor-wait disabled:bg-border-strong disabled:shadow-[0_6px_0_var(--border-strong)]"
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
