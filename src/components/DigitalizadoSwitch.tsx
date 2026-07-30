export function DigitalizadoSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Digitalizado"
      onClick={() => onChange(!checked)}
      className="h-11 px-4 rounded-xl glass-input inline-flex items-center gap-3 select-none transition"
    >
      <span className="text-xs font-semibold tracking-wide text-muted-foreground">
        DIGITALIZADO
      </span>
      <span
        className={[
          "relative inline-flex h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-300 ring-1 ring-inset",
          checked
            ? "bg-emerald-500 ring-emerald-600/40"
            : "bg-muted-foreground/30 ring-black/10",
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
