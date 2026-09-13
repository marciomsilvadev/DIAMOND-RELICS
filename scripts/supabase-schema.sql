-- ==============================================================================
-- SCHEMA SUPABASE: DIAMOND RELICS
-- Execute este script no "SQL Editor" do seu painel Supabase (supabase.com)
-- ==============================================================================

-- 1. TABELA DE PRODUTOS (ACERVO)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT,
  title TEXT NOT NULL,
  athlete TEXT NOT NULL,
  sport TEXT DEFAULT 'futebol',
  category TEXT,
  description TEXT,
  year INTEGER,
  grade TEXT DEFAULT 'Grau COA 9.8 Museu',
  price_brl NUMERIC DEFAULT 0,
  valuation_brl NUMERIC DEFAULT 0,
  installments TEXT,
  status TEXT DEFAULT 'available',
  status_label TEXT DEFAULT 'Peça Única • Disponível',
  stock_count INTEGER DEFAULT 1,
  custodian TEXT DEFAULT 'Cofre de Alta Segurança de Genebra',
  custodian_facility TEXT DEFAULT 'Bóveda Climatizada • Rota Segura para São Paulo',
  insurance_policy TEXT DEFAULT 'Apólice Lloyd''s of London (Cobertura 100%)',
  sha256_hash TEXT,
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT FALSE,
  alt_text TEXT,
  verified_method TEXT DEFAULT 'Espectrometria 8K & Laudo Caligráfico Pericial',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE PEDIDOS (VENDAS)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  product_title TEXT,
  product_id TEXT,
  sku TEXT,
  buyer_name TEXT,
  buyer_doc TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  city TEXT,
  state TEXT,
  date TEXT,
  total_brl NUMERIC DEFAULT 0,
  payment_method TEXT,
  status TEXT DEFAULT 'Aguardando Pagamento',
  status_color TEXT DEFAULT 'amber',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE CONFIGURAÇÕES DO SITE (CMS)
CREATE TABLE IF NOT EXISTS public.site_config (
  id TEXT PRIMARY KEY DEFAULT 'current_config',
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE USUÁRIOS E OPERADORES DO PAINEL
CREATE TABLE IF NOT EXISTS public.admin_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  department TEXT DEFAULT 'Diretoria & Curadoria Geral',
  avatar TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 5. HABILITAR ROW LEVEL SECURITY (RLS) COM POLÍTICAS DE ACESSO
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas de Produtos (Leitura pública para qualquer visitante / Escrita liberada)
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow All Modify Products" ON public.products;
CREATE POLICY "Allow All Modify Products" ON public.products FOR ALL USING (true);

-- Políticas de Pedidos (Leitura e criação liberadas para a loja)
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Orders" ON public.orders;
CREATE POLICY "Public Update Orders" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Delete Orders" ON public.orders;
CREATE POLICY "Public Delete Orders" ON public.orders FOR DELETE USING (true);

-- Políticas de Configurações do Site
DROP POLICY IF EXISTS "Public Read Site Config" ON public.site_config;
CREATE POLICY "Public Read Site Config" ON public.site_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow All Modify Site Config" ON public.site_config;
CREATE POLICY "Allow All Modify Site Config" ON public.site_config FOR ALL USING (true);

-- Políticas de Usuários
DROP POLICY IF EXISTS "Public Read Admin Users" ON public.admin_users;
CREATE POLICY "Public Read Admin Users" ON public.admin_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow All Modify Admin Users" ON public.admin_users;
CREATE POLICY "Allow All Modify Admin Users" ON public.admin_users FOR ALL USING (true);

-- 6. CRIAR BUCKET DE ARMAZENAMENTO PARA FOTOS E VÍDEOS ('relics-media')
INSERT INTO storage.buckets (id, name, public)
VALUES ('relics-media', 'relics-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas do Storage Bucket (Leitura pública e Upload livre)
DROP POLICY IF EXISTS "Public Read Media" ON storage.objects;
CREATE POLICY "Public Read Media" ON storage.objects FOR SELECT USING (bucket_id = 'relics-media');

DROP POLICY IF EXISTS "Public Insert Media" ON storage.objects;
CREATE POLICY "Public Insert Media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'relics-media');

DROP POLICY IF EXISTS "Public Update Media" ON storage.objects;
CREATE POLICY "Public Update Media" ON storage.objects FOR UPDATE USING (bucket_id = 'relics-media');

DROP POLICY IF EXISTS "Public Delete Media" ON storage.objects;
CREATE POLICY "Public Delete Media" ON storage.objects FOR DELETE USING (bucket_id = 'relics-media');

-- 7. USUÁRIOS ADMINISTRADORES PADRÃO
INSERT INTO public.admin_users (id, name, email, password, role, department)
VALUES 
(
  'usr-admin-marcio',
  'Márcio Silva (Administrador)',
  'marcio.msrs@hotmail.com',
  'admin123',
  'admin',
  'Diretoria Executiva'
),
(
  'usr-admin-master',
  'Roberto Silveira (Curador Chefe)',
  'admin@diamondrelics.com',
  'admin123',
  'admin',
  'Diretoria & Curadoria Geral'
)
ON CONFLICT (email) DO NOTHING;

