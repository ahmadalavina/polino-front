import { CheckCircle2, XCircle } from 'lucide-react';

type SubmitStatus = {
  type: 'idle' | 'submitting' | 'success' | 'error';
  message?: string;
};

export function SubmitBanner({ status }: { status: SubmitStatus }) {
  if (status.type === 'idle' || status.type === 'submitting') return null;

  const isSuccess = status.type === 'success';

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border-2 p-4 ${
        isSuccess
          ? 'border-success-soft bg-success-soft text-success-soft-foreground'
          : 'border-danger-soft bg-danger-soft text-danger-soft-foreground'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 shrink-0" size={21} />
      ) : (
        <XCircle className="mt-0.5 shrink-0" size={21} />
      )}
      <p className="text-sm font-bold leading-6">{status.message}</p>
    </div>
  );
}
