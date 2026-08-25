import type { Metadata } from 'next';
import LoginScreen from '@/features/auth/LoginScreen';

export const metadata: Metadata = {
  title: 'ورود | پولینو',
  description: 'ورود به پولینو با شماره موبایل و کد یک‌بار مصرف',
};

export default function LoginPage() {
  return <LoginScreen />;
}
