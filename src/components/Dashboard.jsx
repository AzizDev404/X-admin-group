import React, { useState, useEffect } from 'react';
import { FiTrash2, FiLogOut, FiUsers, FiRefreshCw, FiCheck } from 'react-icons/fi';
import Alert from './Alert';

const Dashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '', showConfirm: false });
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [checkingUserId, setCheckingUserId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const getAuthHeaders = () => {
    const credentials = localStorage.getItem('adminCredentials');
    if (credentials) {
      try {
        const decoded = atob(credentials);
        const [username, password] = decoded.split(':');
        return {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
          'username': username,
          'password': password
        };
      } catch (error) {
        console.error('Failed to decode credentials:', error);
        return { 'Content-Type': 'application/json' };
      }
    }
    return { 'Content-Type': 'application/json' };
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      // Fallback to mock data for demo
      console.warn('Using mock data:', error.message);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      setUsers(mockUsers);
      setAlert({ type: 'error', message: 'API\'ga ulanib bo\'lmadi. Demo ma\'lumotlar ishlatilmoqda.', showConfirm: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = async (userId) => {
    setCheckingUserId(userId);
    
    try {
     const response = await fetch(`${API_URL}/users/${userId}`, {
  method: 'PUT', // ✅ endi PUT
  headers: getAuthHeaders(),
  body: JSON.stringify({ checked: true })
});


      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, checked: true } : user
        ));
        setAlert({ type: 'success', message: 'Foydalanuvchi muvaffaqiyatli tasdiqlandi!', showConfirm: false });
      } else {
        throw new Error('Failed to check user');
      }
    } catch (error) {
      // Fallback for demo - update local state
      console.warn('Demo mode: updating user locally');
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, checked: true } : user
      ));
      setAlert({ type: 'success', message: 'Foydalanuvchi tasdiqlandi (Demo rejim)', showConfirm: false });
    } finally {
      setCheckingUserId(null);
    }
  };

  const handleDelete = async (userId) => {
    const user = users.find(u => u._id === userId);
    setUserToDelete(userId);
    setAlert({ 
      type: 'confirm', 
      message: `"${user?.full_name}" foydalanuvchisini o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi.`,
      showConfirm: true 
    });
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setDeletingUserId(userToDelete);
    setAlert({ type: '', message: '', showConfirm: false });
    
    try {
      const response = await fetch(`${API_URL}/users/${userToDelete}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setUsers(prev => prev.filter(user => user._id !== userToDelete));
        setAlert({ type: 'success', message: 'Foydalanuvchi muvaffaqiyatli o\'chirildi!', showConfirm: false });
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      // Fallback for demo - remove from local state
      console.warn('Demo mode: removing user locally');
      setUsers(prev => prev.filter(user => user._id !== userToDelete));
      setAlert({ type: 'success', message: 'Foydalanuvchi o\'chirildi (Demo rejim)', showConfirm: false });
    } finally {
      setDeletingUserId(null);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setAlert({ type: '', message: '', showConfirm: false });
    setUserToDelete(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminCredentials');
    onLogout();
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const renderActionButtons = (user) => {
    return (
      <div className="flex items-center space-x-2">
        {/* Check button */}
        <button
          onClick={() => handleCheck(user._id)}
          disabled={user.checked || checkingUserId === user._id}
          className={`inline-flex items-center p-2 rounded-lg transition-all duration-200 ${
            user.checked || checkingUserId === user._id
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-green-600 hover:text-green-800 hover:bg-green-50 transform hover:scale-110'
          }`}
        >
          {checkingUserId === user._id ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiCheck className="w-4 h-4" />
          )}
        </button>

        {/* Delete button */}
        <button
          onClick={() => handleDelete(user._id)}
          disabled={!user.checked || deletingUserId === user._id}
          className={`inline-flex items-center p-2 rounded-lg transition-all duration-200 ${
            !user.checked || deletingUserId === user._id
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-red-600 hover:text-red-800 hover:bg-red-50 transform hover:scale-110'
          }`}
        >
          {deletingUserId === user._id ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiTrash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Alert
        type={alert.type}
        message={alert.message}
        showConfirm={alert.showConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FiUsers className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-xl font-bold text-blue-500">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-blue-500">
              Users ({users.length})
            </h2>
          </div>

          {/* Users Table - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telegram ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nickname
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Phone number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-500">
                      {user._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 font-mono">
                      {user.telegram_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 font-medium">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                      {user.nickname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                      {user.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.checked 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.checked ? 'Checked' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderActionButtons(user)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Users Cards - Mobile */}
          <div className="md:hidden divide-y divide-gray-200">
            {users.map((user, index) => (
              <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="space-y-3">
                  {/* User Name & Nickname */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{user.full_name}</h3>
                      <p className="text-sm text-gray-600">{user.nickname}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.checked 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.checked ? 'Checked' : 'Pending'}
                      </span>
                      {renderActionButtons(user)}
                    </div>
                  </div>
                  
                  {/* User Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID:</span>
                      <span className="text-xs text-gray-900 font-mono break-all">{user._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Telegram ID:</span>
                      <span className="text-xs text-gray-700 font-mono">{user.telegram_id}</span>
                    </div>
                  </div>
                </div>
                
                {/* Separator line for all except last item */}
                {index !== users.length - 1 && (
                  <hr className="mt-4 border-gray-200" />
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {users.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <FiUsers className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-blue-500 text-lg">No users found</p>
              <p className="text-gray-400 text-sm mt-2">Users will appear here when available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;