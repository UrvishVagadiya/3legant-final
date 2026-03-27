import { apiService } from '../apiService';
import { createClient } from '@/utils/supabase/client';

export interface UserProfile {
  id: string;
  role: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

export const authApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      queryFn: async () => {
        const res = await fetch('/api/auth/profile');
        const data = await res.json();
        if (!res.ok) return { error: { status: res.status, data: data.error } };
        return { data };
      },
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<any, any>({
      queryFn: async (userData) => {
        const supabase = createClient();
        const { data, error } = await supabase.auth.updateUser({
          data: userData
        });
        if (error) return { error };
        return { data: data.user };
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
