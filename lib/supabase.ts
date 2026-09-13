import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}

/**
 * Faz upload de uma imagem ou vídeo para o Supabase Storage Bucket ('relics-media')
 * Retorna a URL pública do arquivo hospedado no CDN.
 */
export async function uploadMediaToSupabase(
  file: File | Blob,
  fileName: string,
  bucketName = 'relics-media'
): Promise<{ url: string | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { url: null, error: 'Supabase não está configurado com as chaves de API.' };
  }

  try {
    const ext = fileName.split('.').pop() || 'webp';
    const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `uploads/${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: publicData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Erro no upload' };
  }
}

/**
 * Executa uma operação assíncrona do Supabase com tratamento seguro de exceções
 */
export async function safeExecute<T>(promiseLike: PromiseLike<T> | Promise<T>): Promise<T | null> {
  try {
    return await promiseLike;
  } catch (err) {
    console.error('Erro na operação Supabase:', err);
    return null;
  }
}

