CREATE TABLE public.codigos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  prazo INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.etiquetas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ano TEXT NOT NULL DEFAULT '',
  final TEXT NOT NULL DEFAULT '',
  vaga TEXT NOT NULL DEFAULT '',
  codigos JSONB NOT NULL DEFAULT '[]'::jsonb,
  destino TEXT,
  guarda TEXT,
  permanente BOOLEAN,
  tipo TEXT,
  digitalizado BOOLEAN NOT NULL DEFAULT false,
  local TEXT,
  tipo_doc TEXT,
  letra TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.codigos TO anon, authenticated;
GRANT ALL ON public.codigos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.etiquetas TO anon, authenticated;
GRANT ALL ON public.etiquetas TO service_role;

ALTER TABLE public.codigos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etiquetas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "codigos_public_all" ON public.codigos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "etiquetas_public_all" ON public.etiquetas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.codigos REPLICA IDENTITY FULL;
ALTER TABLE public.etiquetas REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.codigos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.etiquetas;