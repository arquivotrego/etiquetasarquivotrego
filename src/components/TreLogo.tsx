import logoUrl from "@/assets/tre-go-logo.svg?url";

export function TreLogo({ size = 56 }: { size?: number }) {
  return (
    <img
      src={logoUrl}
      alt="Tribunal Regional Eleitoral de Goiás"
      style={{ height: size, width: "auto", display: "block" }}
    />
  );
}
