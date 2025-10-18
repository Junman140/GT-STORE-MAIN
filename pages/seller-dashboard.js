import React, { useState, useEffect } from 'react';
import { usePiNetwork } from '@/contexts/PiNetworkContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';

export default function SellerDashboard() {
  const { user, isAuthenticated, isLoading } = usePiNetwork();
  const router = useRouter();
  const [listings, setListings] = useState({ phones: [], laptops: [] });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [stats, setStats] = useState({ totalListings: 0, totalOrders: 0, pendingOrders: 0 });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    } else if (user && user.role !== 'seller' && user.role !== 'admin') {
      router.push('/apply-seller');
    } else if (user && (user.role === 'seller' || user.role === 'admin')) {
      fetchSellerData();
    }
  }, [user, isAuthenticated, isLoading, router]);

  const fetchSellerData = async () => {
    try {
      const userId = user?.id || user?.user_uid || user?.uid;
      
      // Fetch phones
      const phonesResponse = await fetch('/api/phones');
      const phonesData = await phonesResponse.json();
      const userPhones = phonesData.filter(phone => {
        const phoneSellerId = phone.seller?.id || phone.seller?.user_uid || phone.sellerId;
        return phoneSellerId === userId || phoneSellerId === user?.id;
      });

      // Fetch laptops
      const laptopsResponse = await fetch('/api/laptops');
      const laptopsData = await laptopsResponse.json();
      const userLaptops = laptopsData.filter(laptop => {
        const laptopSellerId = laptop.seller?.id || laptop.seller?.user_uid || laptop.sellerId;
        return laptopSellerId === userId || laptopSellerId === user?.id;
      });

      // Fetch orders
      const ordersResponse = await fetch(`/api/orders?userId=${userId}&role=seller`);
      const ordersData = await ordersResponse.json();
      const sellerOrders = ordersData.orders || [];

      setListings({
        phones: userPhones,
        laptops: userLaptops
      });

      setOrders(sellerOrders);

      setStats({
        totalListings: userPhones.length + userLaptops.length,
        totalOrders: sellerOrders.length,
        pendingOrders: sellerOrders.filter(order => order.status === 'paid' || order.status === 'shipped').length
      });
    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus, trackingNumber = null) => {
    try {
      const updateData = { status: newStatus };
      if (trackingNumber) updateData.trackingNumber = trackingNumber;

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Order ${newStatus} successfully!`);
        fetchSellerData(); // Refresh the data
      } else {
        alert(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('An error occurred while updating the order');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to mark this order as completed?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'complete'
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Order marked as completed successfully!');
        fetchSellerData(); // Refresh the data
      } else {
        alert(data.error || 'Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      alert('An error occurred while completing the order');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return null;
  }

  const allListings = [...listings.phones, ...listings.laptops];

  return (
    <>
      <Head>
        <title>Seller Dashboard - GT Store</title>
        <meta name="description" content="Manage your listings on GT Store" />
      </Head>

      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              {user.role === 'admin' ? 'Admin Dashboard' : 'Seller Dashboard'}
            </h1>
            <p className="text-gray-300">
              Welcome back, {user.piUsername || user.user_uid}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 shadow-soft">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-900/20 border border-blue-400/30 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Listings</p>
                  <p className="text-2xl font-semibold text-white">{stats.totalListings}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 shadow-soft">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-900/20 border border-green-400/30 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Orders</p>
                  <p className="text-2xl font-semibold text-white">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 shadow-soft">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-900/20 border border-orange-400/30 rounded-md p-3">
                  <svg className="h-6 w-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Pending Orders</p>
                  <p className="text-2xl font-semibold text-white">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/create" className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition-all shadow-soft">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-brand-blue rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold text-white">Create Listing</p>
                  <p className="text-sm text-gray-300">Add new phone or laptop</p>
                </div>
              </div>
            </Link>

            <Link href="/messages" className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition-all shadow-soft">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-900/20 border border-green-400/30 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold text-white">Messages</p>
                  <p className="text-sm text-gray-300">View buyer inquiries</p>
                </div>
              </div>
            </Link>

            {/* Admin-only link */}
            {user.role === 'admin' && (
              <Link href="/admin-dashboard" className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition-all shadow-soft">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-900/20 border border-purple-400/30 rounded-md p-3">
                    <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-semibold text-white">Admin Dashboard</p>
                    <p className="text-sm text-gray-300">Monitor payments & trades</p>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-white/20 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'listings', label: 'My Listings', count: stats.totalListings },
                { id: 'orders', label: 'Orders', count: stats.totalOrders }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-white/10 text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-soft p-12 text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No orders yet
                  </h3>
                  <p className="text-gray-600">
                    Orders will appear here when customers purchase your listings.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-soft p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Buyer: {order.buyer?.piUsername || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Amount: {order.amount} π
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'paid' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            order.status === 'a2u_failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address:</h4>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress.fullName}<br />
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                            {order.shippingAddress.country}
                          </p>
                        </div>
                      )}

                      {/* Tracking Info */}
                      {order.trackingNumber && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">Tracking Number:</h4>
                          <p className="text-sm text-blue-700 font-mono">{order.trackingNumber}</p>
                        </div>
                      )}

                      {/* Order Actions */}
                      <div className="flex gap-2">
                        {order.status === 'paid' && (
                          <>
                            <button
                              onClick={() => {
                                const trackingNumber = prompt('Enter tracking number:');
                                if (trackingNumber) {
                                  handleOrderStatusUpdate(order.id, 'shipped', trackingNumber);
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              Mark as Shipped
                            </button>
                          </>
                        )}
                        
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleOrderStatusUpdate(order.id, 'delivered')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                          >
                            Mark as Delivered
                          </button>
                        )}

                        {order.status === 'delivered' && (
                          <button
                            onClick={() => handleCompleteOrder(order.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                          >
                            Complete Order
                          </button>
                        )}

                        <Link
                          href={`/messages?order=${order.id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                          Contact Buyer
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <>
              {/* Listings Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'all', label: 'All Listings', count: stats.totalListings },
                    { id: 'phones', label: 'Phones', count: listings.phones.length },
                    { id: 'laptops', label: 'Laptops', count: listings.laptops.length }
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
                      <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Listings Grid */}
              {(() => {
                const allListings = [...listings.phones, ...listings.laptops];
                const filteredListings = 
                  activeTab === 'phones' ? listings.phones :
                  activeTab === 'laptops' ? listings.laptops :
                  allListings;

                if (filteredListings.length === 0) {
                  return (
                    <div className="bg-white rounded-lg shadow-soft p-12 text-center">
                      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No listings yet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Create your first listing to start selling on GT Store.
                      </p>
                      <Link
                        href="/create"
                        className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-blue text-white font-semibold hover:bg-brand-dark"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Listing
                      </Link>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredListings.map((listing) => {
                      const isPhone = listing.type === 'Smartphone' || listing.brand;
                      const href = isPhone ? `/phones/${listing.id}` : `/laptops/${listing.id}`;
                      const listingType = isPhone ? 'phone' : 'laptop';
                      
                      return (
                        <div key={listing.id} className="relative group">
                          <ListingCard item={listing} href={href} seller={user} />
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => router.push(href)}
                              className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                              title="View listing"
                            >
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => router.push(`${href}?edit=1`)}
                              className="bg-yellow-500 rounded-full p-2 shadow-lg hover:bg-yellow-600"
                              title="Edit listing"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </>
  );
}


