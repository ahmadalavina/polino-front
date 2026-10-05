import { Coins } from 'lucide-react';

export function BlockHint() {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-warning-soft p-4 text-xs font-bold leading-6 text-warning-soft-foreground">
      <Coins size={19} className="shrink-0 text-warning-strong" />
      بعد از ذخیره، ترتیب بلاک خودکار یک شماره افزایش پیدا می‌کند.
    </div>
  );
}
