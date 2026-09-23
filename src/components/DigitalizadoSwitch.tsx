export function DigitalizadoSwitch({
  checked,
  onChange,
  label = "DIGITALIZADO",
  tone = "emerald",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  tone?: "emerald" | "amber";
}) {
  const on =
    tone === "amber" ? "bg-amber-400 ring-amber-500/40" : "bg-emerald-500 ring-emerald-600/40";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="h-11 px-4 rounded-xl glass-input inline-flex items-center gap-3 select-none transition"
    >
      <span className="text-xs font-semibold tracking-wide text-muted-foreground">{label}</span>
      <span
        className={[
          "relative inline-flex h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-300 ring-1 ring-inset",
          checked ? on : "bg-muted-foreground/30 ring-black/10",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-[2px] left-[2px] h-[22px] w-[22px] rounded-full bg-white shadow-md transition-transform duration-300 ease-out",
            checked ? "translate-x-[20px]" : "translate-x-0",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
