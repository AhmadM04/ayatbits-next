import { redirect } from 'next/navigation';

// Redirect /dashboard/mushaf to the first page
export default function MushafIndexPage() {
  redirect('/dashboard/mushaf/page/1');
}


