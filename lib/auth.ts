import { cookies } from 'next/headers';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('role');
  const nameCookie = cookieStore.get('name');
  const userIdCookie = cookieStore.get('userId');

  if (!roleCookie?.value) {
    return null;
  }

  return {
    role: roleCookie.value,
    name: nameCookie?.value || 'User',
    userId: userIdCookie?.value || '',
  };
}
