import { useState, useEffect } from 'react';
import { usePiNetwork } from '../contexts/PiNetworkContext';

export default function AdminPanel() {
  const { user } = usePiNetwork();
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You need admin privileges to access this panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seller-applications');
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/donations');
      const data = await response.json();
      if (data.success) {
        setDonations(data.donations);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'donations') {
      fetchDonations();
    }
  }, [activeTab]);

  const handleApplicationAction = async (applicationId, action, notes = '') => {
    try {
      const userId = user?.id || user?.user_uid || user?.uid;
      const response = await fetch(`/api/seller-applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action,
          notes,
          reviewedBy: userId
        }),
      });

      const data = await response.json();
      if (data.success) {
        const message = action === 'approved' 
          ? `Application approved successfully! User is now a seller.\n\nNote: If you approved your own application, refresh your browser to see seller features.`
          : `Application rejected successfully.`;
        alert(message);
        fetchApplications(); // Refresh the list
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to update application');
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      if (data.success) {
        alert('User role updated successfully!');
        fetchUsers(); // Refresh the list
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to update user role');
    }
  };

  const tabs = [
    { id: 'applications', label: 'Seller Applications', count: applications.length },
    { id: 'users', label: 'Users', count: users.length },
    { id: 'donations', label: 'Donations', count: donations.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage seller applications, users, and donations</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'applications' && (
              <ApplicationsTab
                applications={applications}
                onAction={handleApplicationAction}
              />
            )}
            {activeTab === 'users' && (
              <UsersTab users={users} onRoleChange={handleUserRoleChange} />
            )}
            {activeTab === 'donations' && (
              <DonationsTab donations={donations} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Applications Tab Component
function ApplicationsTab({ applications, onAction }) {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [notes, setNotes] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Seller Applications
          </h3>
          
          {applications.length === 0 ? (
            <p className="text-gray-500">No applications found.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {application.businessName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {application.businessType} • {application.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        Applied by {application.user.piUsername || application.user.user_uid}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{application.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Applied: {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                    
                    {application.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setNotes('');
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Review Application: {selectedApplication.businessName}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Details
                </label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p><strong>Type:</strong> {selectedApplication.businessType}</p>
                  <p><strong>Location:</strong> {selectedApplication.location}</p>
                  <p><strong>Email:</strong> {selectedApplication.email}</p>
                  {selectedApplication.phone && (
                    <p><strong>Phone:</strong> {selectedApplication.phone}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p>{selectedApplication.description}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add any notes about your decision..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onAction(selectedApplication.id, 'rejected', notes);
                  setSelectedApplication(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  onAction(selectedApplication.id, 'approved', notes);
                  setSelectedApplication(null);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Users Tab Component
function UsersTab({ users, onRoleChange }) {
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState('');

  const handleRoleSubmit = (userId) => {
    if (newRole && window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      onRoleChange(userId, newRole);
      setEditingUserId(null);
      setNewRole('');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Users Management
        </h3>
        
        {users.length === 0 ? (
          <p className="text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.piUsername || user.user_uid}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.user_uid}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Select...</option>
                            <option value="reader">Reader</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRoleSubmit(user.id)}
                            className="text-green-600 hover:text-green-800 text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(null);
                              setNewRole('');
                            }}
                            className="text-gray-600 hover:text-gray-800 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'seller' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingUserId !== user.id && (
                        <button
                          onClick={() => {
                            setEditingUserId(user.id);
                            setNewRole(user.role);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Change Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Donations Tab Component
function DonationsTab({ donations }) {
  const totalDonations = donations.reduce((sum, donation) => sum + donation.amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Donation Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-600">Total Donations</p>
            <p className="text-2xl font-bold text-blue-900">{totalDonations.toFixed(2)} π</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-600">Completed</p>
            <p className="text-2xl font-bold text-green-900">
              {donations.filter(d => d.status === 'completed').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">
              {donations.filter(d => d.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Donations
          </h3>
          
          {donations.length === 0 ? (
            <p className="text-gray-500">No donations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donations.map((donation) => (
                    <tr key={donation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {donation.amount} π
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                          donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donation.txid ? (
                          <span className="font-mono text-xs">{donation.txid.slice(0, 16)}...</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
