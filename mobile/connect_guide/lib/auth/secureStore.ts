import * as SecureStore from 'expo-secure-store';

const JWT_KEY = 'jwt_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ROLE_KEY = 'user_role';

export const storeJWT = (token: string) => SecureStore.setItemAsync(JWT_KEY, token);
export const getJWT = () => SecureStore.getItemAsync(JWT_KEY);
export const storeRefreshToken = (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
export const storeUserRole = (role: string) => SecureStore.setItemAsync(USER_ROLE_KEY, role);
export const getUserRole = () => SecureStore.getItemAsync(USER_ROLE_KEY);

export const clearAll = async () => {
  await SecureStore.deleteItemAsync(JWT_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_ROLE_KEY);
};
