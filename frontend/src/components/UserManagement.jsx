import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { UserPlus, Edit, UserX, Check, X } from 'lucide-react';

export function UserManagement({ user, onLogout, onNavigate }) {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: '',
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError('');
      
      const response = await fetch('http://localhost:8000/ListUsers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
      } else {
        setUsersError(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      setUsersError('Network error. Please check your connection.');
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  if (user.role !== 'admin') {
    return (
      <div className="flex min-h-screen">
        <Navigation user={user} currentPage="users" onNavigate={onNavigate} />
        <div className="flex-1 flex flex-col">
          <Header user={user} onLogout={onLogout} />
          <main className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <UserX className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You do not have permission to access this page.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'user', status: '' });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleEdit = (userData) => {
    setEditingUser(userData);
    setFormData({
      username: userData.username,
      email: userData.email,
      password: '', // Always blank for editing
      role: userData.role,
      status: userData.status,
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (editingUser) {
        // For editing user, call the UpdateUser API
        const updatePayload = {
          user_id: editingUser.id,
          role: formData.role,
          status: formData.status,
          modifiedby: user.email || user.username
        };
        
        // Only include password if it's provided
        if (formData.password && formData.password.trim()) {
          updatePayload.password = formData.password;
        }
        
        const response = await fetch('http://localhost:8000/UpdateUser', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        });

        const data = await response.json();

        if (data.success) {
          setSuccess('User updated successfully!');
          // Refresh users list from database
          await fetchUsers();
          setShowModal(false);
          setSuccess('');
        } else {
          setError(data.message || 'Failed to update user');
        }
      } else {
        // For creating new user, call the API
        const response = await fetch('http://localhost:8000/createUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.username,
            email: formData.email,
            role: formData.role,
            password: formData.password,
            status: formData.status,
            createdby: user.email || user.username,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setSuccess('User created successfully!');

          // Add new user to local state
          // const newUser = {
          //   id: String(users.length + 1),
          //   username: data.data.name,
          //   email: data.data.email,
          //   role: data.data.role,
          //   status: data.data.status,
          //   createdAt: new Date().toISOString().split('T')[0],
          // };

          // Refresh users list from database
          await fetchUsers();
          
          setShowModal(false);
          setSuccess('');
        } else {
          setError(data.message || 'Failed to create user');
        }
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
      console.error('User creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
        : u
    ));
  };

  return (
    <div className="flex min-h-screen">
      <Navigation user={user} currentPage="users" onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-12xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-gray-900">User Management</h2>
                  <p className="text-gray-600 mt-1">Manage system users and permissions</p>
                </div>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Create User
                </button>
              </div>

              {usersError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>{usersError}</span>
                    <button
                      onClick={fetchUsers}
                      className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading users...</span>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No users found</p>
                    <button
                      onClick={fetchUsers}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700">Username</th>
                        <th className="px-6 py-3 text-left text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-gray-700">Role</th>
                        <th className="px-6 py-3 text-left text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-gray-700">Date Created</th>
                        <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((userData) => (
                        <tr key={userData.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-gray-900">{userData.username}</td>
                          <td className="px-6 py-4 text-gray-600">{userData.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full ${
                                userData.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : userData.role === 'manager'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {userData.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full ${
                                userData.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {userData.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{userData.datecreated}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(userData)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit user"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                //onClick={() => handleToggleStatus(userData.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  userData.status === 'ACTIVE'
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                title={userData.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              >
                                {userData.status === 'ACTIVE' ? (
                                  <UserX className="w-4 h-4" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-gray-900 mb-4">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    editingUser 
                      ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  placeholder="Enter full name"
                  disabled={loading || editingUser}
                  readOnly={editingUser}
                  autoComplete="off"
                  required={!editingUser}
                />
                {editingUser && (
                  <p className="mt-1 text-sm text-gray-500">Name cannot be changed</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    editingUser 
                      ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  placeholder="Enter email address"
                  disabled={loading || editingUser}
                  readOnly={editingUser}
                  autoComplete="new-email"
                  required={!editingUser}
                />
                {editingUser && (
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Password {editingUser && <span className="text-sm text-gray-500">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editingUser ? "Enter new password (optional)" : "Enter password (minimum 8 characters)"}
                  disabled={loading}
                  minLength={8}
                  autoComplete="new-password"
                  required={!editingUser}
                />
                {editingUser && (
                  <p className="mt-1 text-sm text-gray-500">Only enter password if you want to change it</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {loading ? 'Processing...' : (editingUser ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
