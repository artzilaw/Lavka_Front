import { apiClient, translateError } from '@/shared/api/client';
import { User, ServerValidationErrors } from './model';

export const userApi = {
  async checkSession() {
    return apiClient.post<User>('/auth/login');
  },

  async login(email: string, password: string) {
    return apiClient.post<User & ServerValidationErrors>('/auth/login', {
      email: email.trim(),
      password,
    });
  },

  async register(name: string, email: string, password: string) {
    return apiClient.post<User & ServerValidationErrors>('/auth/register', {
      name: name.trim(),
      email: email.trim(),
      password,
    });
  },

  async logout() {
    return apiClient.post<{ status: string }>('/auth/logout');
  },

  async getProfile() {
    return apiClient.get<User>('/profile');
  },

  async updateProfile(name: string, email: string) {
    const res = await apiClient.patch<User & ServerValidationErrors>('/profile', {
      name: name.trim(),
      email: email.trim(),
    });
    if (!res.success && res.data) {
      return {
        ...res,
        fieldErrors: {
          name: res.data.name ? translateError(res.data.name) : undefined,
          email: res.data.email ? translateError(res.data.email) : undefined,
        },
      };
    }
    return { ...res, fieldErrors: undefined };
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await apiClient.post<{ status: string } & ServerValidationErrors>('/profile/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    if (!res.success && res.data) {
      return {
        ...res,
        fieldErrors: {
          currentPassword: res.data.current_password
            ? translateError(res.data.current_password)
            : undefined,
          newPassword: res.data.new_password ? translateError(res.data.new_password) : undefined,
        },
      };
    }
    return { ...res, fieldErrors: undefined };
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<User>('/profile/avatar', formData);
  },
};
