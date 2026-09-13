import { BookOpen, Boxes, School } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type AdminSection = 'course' | 'lesson' | 'block';

export type SectionDefinition = {
  id: AdminSection;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  shadow: string;
};

export const sections: SectionDefinition[] = [
  {
    id: 'course',
    title: 'ساخت دوره',
    subtitle: 'اطلاعات اصلی مسیر آموزشی',
    icon: School,
    color: 'bg-[#7c5cff]',
    shadow: 'shadow-[0_5px_0_#6245dc]',
  },
  {
    id: 'lesson',
    title: 'ساخت درس',
    subtitle: 'افزودن درس به یک دوره',
    icon: BookOpen,
    color: 'bg-[#16b8a6]',
    shadow: 'shadow-[0_5px_0_#0c9082]',
  },
  {
    id: 'block',
    title: 'ساخت بلاک',
    subtitle: 'محتوای مرحله‌ای هر درس',
    icon: Boxes,
    color: 'bg-[#ff8a55]',
    shadow: 'shadow-[0_5px_0_#e56f3d]',
  },
];

export function AdminNav({
  sections: sectionDefs,
  activeSection,
  onSectionChange,
}: {
  sections: SectionDefinition[];
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}) {
  return (
    <nav className="rounded-[28px] border-2 border-white bg-white/95 p-3 shadow-[0_14px_45px_rgba(38,61,89,0.1)]">
      {sectionDefs.map((section, index) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSectionChange(section.id)}
            className={`flex w-full items-center gap-3 rounded-2xl p-3 text-start transition-all ${
              isActive
                ? 'bg-slate-50'
                : 'hover:bg-slate-50/70'
            }`}
          >
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-2xl text-white ${section.color} ${section.shadow}`}
            >
              <Icon size={22} strokeWidth={2.7} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-slate-700">
                {index + 1}. {section.title}
              </span>
              <span className="mt-1 block truncate text-[11px] font-medium text-slate-400">
                {section.subtitle}
              </span>
            </span>
            {isActive && (
              <span className="size-2 rounded-full bg-[#58cc59]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
