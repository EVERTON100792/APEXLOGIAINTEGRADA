-- Schema de Banco de Dados - APEX-LOG 3.0
-- Este script cria todas as tabelas necessárias para o sistema e configura a segurança.

-- 1. Tabela de Perfis de Usuário (Profiles)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Sessões Salvas (Saved Sessions)
CREATE TABLE saved_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Compartilhamento de Sessões (Session Shares)
CREATE TABLE session_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES saved_sessions(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, shared_with)
);

-- 4. Tabela de Configurações de Frete (Freight Configs)
CREATE TABLE freight_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  config_data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Configurações de Veículos (Vehicle Configs)
CREATE TABLE vehicle_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  config_data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Atividades (Activities - Logs e Auditoria)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Configurações de Email (Email Configs)
CREATE TABLE email_configs (
  id TEXT PRIMARY KEY,
  valor TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Motoristas (Email Motoristas)
CREATE TABLE email_motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT UNIQUE NOT NULL,
  codigo TEXT,
  placa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_motoristas ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Policies)

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Saved Sessions (Dono pode ver, editar e deletar; Usuário compartilhado pode ver)
CREATE POLICY "Users can view own sessions" ON saved_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view shared sessions" ON saved_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM session_shares WHERE session_id = saved_sessions.id AND shared_with = auth.uid())
);
CREATE POLICY "Users can insert own sessions" ON saved_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON saved_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON saved_sessions FOR DELETE USING (auth.uid() = user_id);

-- Session Shares
CREATE POLICY "Users can view shares of their sessions" ON session_shares FOR SELECT USING (
  EXISTS (SELECT 1 FROM saved_sessions WHERE id = session_shares.session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view shares to them" ON session_shares FOR SELECT USING (shared_with = auth.uid());
CREATE POLICY "Users can insert shares for own sessions" ON session_shares FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM saved_sessions WHERE id = session_shares.session_id AND user_id = auth.uid())
);

-- Freight Configs
CREATE POLICY "Users can manage own freight configs" ON freight_configs FOR ALL USING (auth.uid() = user_id);

-- Vehicle Configs
CREATE POLICY "Users can manage own vehicle configs" ON vehicle_configs FOR ALL USING (auth.uid() = user_id);

-- Activities
CREATE POLICY "Users can manage own activities" ON activities FOR ALL USING (auth.uid() = user_id);

-- Email Configs (Permitir acesso para todos os usuários autenticados para leitura e escrita)
CREATE POLICY "Authenticated users can manage email configs" ON email_configs FOR ALL USING (auth.role() = 'authenticated');

-- Email Motoristas (Permitir acesso para todos os usuários autenticados para leitura e escrita)
CREATE POLICY "Authenticated users can manage motoristas" ON email_motoristas FOR ALL USING (auth.role() = 'authenticated');


-- Trigger para criar Profile automaticamente ao registrar um novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger se existir e recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 9. Tabela de Configuracoes do Admin (Admin Config)
CREATE TABLE apex_admin_config (
  config_key TEXT PRIMARY KEY,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE apex_admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON apex_admin_config FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated manage" ON apex_admin_config FOR ALL USING (auth.role() = 'authenticated');
