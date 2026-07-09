import logoRaw from "@/assets/tre-go-logo.svg?raw";

export function TreLogo({ size = 56 }: { size?: number }) {
  return (
    <div
      aria-label="Tribunal Regional Eleitoral de Goiás"
      role="img"
      style={{ height: size, width: "auto", display: "block" }}
      className="text-black dark:text-white [&_svg]:h-full [&_svg]:w-auto"
      dangerouslySetInnerHTML={{ __html: logoRaw }}
    />
  );
}
