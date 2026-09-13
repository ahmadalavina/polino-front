import { Plus, Sparkles } from 'lucide-react';

export function AdminHero() {
  return (
    <section className="relative mb-7 overflow-hidden rounded-[32px] border-2 border-white bg-white/95 p-6 shadow-[0_20px_65px_rgba(38,61,89,0.12)] backdrop-blur sm:p-8">
      <div className="absolute -end-14 -top-16 size-48 rounded-full bg-[#eafffb]" />
      <Sparkles
        className="absolute end-10 top-8 hidden text-[#16b8a6] sm:block"
        size={32}
      />
      <div className="relative max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-[#58cc59] text-white shadow-[0_5px_0_#3da83e]">
            <Plus size={28} strokeWidth={3} />
          </div>
          <div>
            <p className="mb-1 text-xs font-black text-[#58b759]">
              پنل تولید محتوا
            </p>
            <h1 className="text-2xl font-black leading-9 text-slate-800 sm:text-3xl">
              ساخت دوره، درس و بلاک
            </h1>
          </div>
        </div>
        <p className="text-sm font-medium leading-7 text-slate-500 sm:text-base">
          ابتدا دوره را بسازید، سپس درس‌های آن را اضافه کنید و در پایان
          محتوای مرحله‌ای هر درس را بچینید.
        </p>
      </div>
    </section>
  );
}
