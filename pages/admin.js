import AdminPanel from '../components/AdminPanel';
import Head from 'next/head';

export default function AdminPage() {
  return (
    <>
      <Head>
        <title>Admin Panel - GT Store</title>
        <meta name="description" content="Admin panel for managing GT Store marketplace" />
      </Head>
      <AdminPanel />
    </>
  );
}
