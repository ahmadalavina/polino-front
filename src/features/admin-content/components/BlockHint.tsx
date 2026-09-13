import { Coins } from 'lucide-react';

export function BlockHint() {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-[#fff7d6] p-4 text-xs font-bold leading-6 text-[#8a6100]">
      <Coins size={19} className="shrink-0 text-amber-500" />
      بعد از ذخیره، ترتیب بلاک خودکار یک شماره افزایش پیدا می‌کند.
    </div>
  );
}
