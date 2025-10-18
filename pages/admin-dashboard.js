import React, { useState, useEffect } from 'react';
import { usePiNetwork } from '@/contexts/PiNetworkContext';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = usePiNetwork();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalDonations: 0,
    completedOrders: 0,
    pendingOrders: 0,
    failedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    } else if (user && user.role !== 'admin') {
      router.push('/');
    } else if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user, isAuthenticated, isLoading, router]);

  const fetchAdminData = async () => {
    try {
      // Fetch all orders
      const ordersResponse = await fetch('/api/admin/orders');
      const ordersData = await ordersResponse.json();
      setOrders(ordersData.orders || []);

      // Fetch all donations
      const donationsResponse = await fetch('/api/admin/donations');
      const donationsData = await donationsResponse.json();
      setDonations(donationsData.donations || []);

      // Calculate stats
      const totalOrders = ordersData.orders?.length || 0;
      const totalRevenue = ordersData.orders?.reduce((sum, order) => sum + (order.platformFee || 0), 0) || 0;
      const totalDonations = donationsData.donations?.reduce((sum, donation) => sum + donation.amount, 0) || 0;
      const completedOrders = ordersData.orders?.filter(order => order.status === 'completed').length || 0;
      const pendingOrders = ordersData.orders?.filter(order => order.status === 'paid' || order.status === 'shipped').length || 0;
      const failedOrders = ordersData.orders?.filter(order => order.status === 'a2u_failed').length || 0;

      setStats({
        totalOrders,
        totalRevenue,
        totalDonations,
        completedOrders,
        pendingOrders,
        failedOrders
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - GT Store</title>
        <meta name="description" content="Admin dashboard for monitoring payments and trades" />
      </Head>

      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-300">Monitor all payments and successful trades</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Platform Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalRevenue.toFixed(2)} π</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Donations</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalDonations.toFixed(2)} π</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completedOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Failed Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.failedOrders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'orders', label: 'All Orders', count: stats.totalOrders },
                { id: 'donations', label: 'Donations', count: donations.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-soft p-12 text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600">Orders will appear here when customers make purchases.</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-soft overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">All Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform Fee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              {order.id.slice(-8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.buyer?.piUsername || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.seller?.piUsername || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.amount} π
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.platformFee} π
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                order.status === 'a2u_failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div className="space-y-4">
              {donations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-soft p-12 text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
                  <p className="text-gray-600">Donations will appear here when users make contributions.</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-soft overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">All Donations</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donation ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {donations.map((donation) => (
                          <tr key={donation.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              {donation.id.slice(-8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {donation.user?.piUsername || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {donation.amount} π
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-soft">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                </div>
                <div className="p-6">
                  {orders.slice(0, 5).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent orders</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                            <p className="text-xs text-gray-500">
                              {order.buyer?.piUsername} → {order.seller?.piUsername}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{order.amount} π</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Donations */}
              <div className="bg-white rounded-lg shadow-soft">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
                </div>
                <div className="p-6">
                  {donations.slice(0, 5).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent donations</p>
                  ) : (
                    <div className="space-y-3">
                      {donations.slice(0, 5).map((donation) => (
                        <div key={donation.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Donation #{donation.id.slice(-8)}</p>
                            <p className="text-xs text-gray-500">{donation.user?.piUsername}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{donation.amount} π</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {donation.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
