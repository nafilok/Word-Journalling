import { redirect } from 'next/navigation';

export default function RootPage() {
  // Pengalihan otomatis di sisi server menuju halaman login
  redirect('/login');
}