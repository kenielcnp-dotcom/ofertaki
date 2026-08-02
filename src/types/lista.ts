import type { Database } from './database.types';
import type { Profile } from './user';

export type Lista = Database['public']['Tables']['listas']['Row'];
export type ListaMembroRow = Database['public']['Tables']['lista_membros']['Row'];

export type ListaMembroWithProfile = ListaMembroRow & {
  profiles: Pick<Profile, 'username' | 'avatar_url'> | null;
};
