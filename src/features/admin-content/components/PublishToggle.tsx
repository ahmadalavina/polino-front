export function PublishToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 border-border bg-surface-muted p-4">
      <span>
        <span className="block text-sm font-black text-foreground">
          انتشار محتوا
        </span>
        <span className="mt-1 block text-xs font-medium text-subtle">
          بعد از ساخت برای کاربران قابل نمایش باشد
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-success"
      />
    </label>
  );
}
