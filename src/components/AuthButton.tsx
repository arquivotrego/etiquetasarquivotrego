import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export function AuthButton() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setLoading(false);
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada.");
  };

  if (email) {
    return (
      <button
        type="button"
        onClick={signOut}
        title={`Sair (${email})`}
        className="h-10 px-3 rounded-xl glass-input flex items-center gap-2 hover:bg-white/80 transition text-foreground text-xs font-medium"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden md:inline max-w-[160px] truncate">{email}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={loading}
      className="h-10 px-3 rounded-xl glass-input flex items-center gap-2 hover:bg-white/80 transition text-foreground text-xs font-medium disabled:opacity-60"
    >
      <LogIn className="h-4 w-4" />
      <span className="hidden md:inline">{loading ? "Entrando..." : "Entrar com Google"}</span>
    </button>
  );
}
