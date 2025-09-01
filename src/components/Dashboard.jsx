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

  // Mock data for demo purposes
  const mockUsers = [
    {
      _id: '1',
      telegram_id: 123456789,
      full_name: 'Ali Valiyev',
      class: '10',
      group: 'A',
      student_parrent: 'Father',
      parnet_full_name: 'Vali Aliyev',
      phone_number: '+998901234567',
      checked: false,
      language: 'uz'
    },
    {
      _id: '2',
      telegram_id: 987654321,
      full_name: 'Fatima Karimova',
      class: '9',
      group: 'B',
      student_parrent: 'Mother',
      parnet_full_name: 'Nodira Karimova',
      phone_number: '+998907654321',
      checked: true,
      language: 'ru'
    }
  ];

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
        method: 'PUT',
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
          <span className="text-gray-700 font-medium">Foydalanuvchilar yuklanmoqda...</span>
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
                Yangilash
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                Chiqish
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
              Foydalanuvchilar ({users.length})
            </h2>
          </div>

          {/* Users Cards - Mobile-like Design for all screens */}
          <div className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <div key={user._id} className="p-6 transition-colors duration-200">
                <div className="space-y-4">
                  {/* Header: Name, Status and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                      <p className="text-sm text-gray-500">ID: {user._id}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user.checked 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.checked ? 'Tasdiqlangan' : 'Kutilmoqda'}
                      </span>
                      {renderActionButtons(user)}
                    </div>
                  </div>
                  
                  {/* User Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Telegram ID</span>
                      <span className="text-sm text-gray-900 font-mono">{user.telegram_id}</span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Sinf</span>
                      <span className="text-sm text-gray-900">{user.class || 'Belgilanmagan'}</span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Guruh</span>
                      <span className="text-sm text-gray-900">{user.group || 'Belgilanmagan'}</span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Ota/Ona</span>
                      <span className="text-sm text-gray-900">
                        {user.student_parrent === 'Father' ? 'Ota' : 
                         user.student_parrent === 'Mother' ? 'Ona' : 
                         'Belgilanmagan'}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Ota/Ona ismi</span>
                      <span className="text-sm text-gray-900">{user.parnet_full_name || 'Belgilanmagan'}</span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Telefon raqam</span>
                      <span className="text-sm text-gray-900">{user.phone_number || 'Belgilanmagan'}</span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Til</span>
                      <span className="text-sm text-gray-900">
                        {user.language === 'uz' ? "O'zbek" : user.language === 'ru' ? 'Rus' : 'Belgilanmagan'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {users.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <FiUsers className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-blue-500 text-lg">Foydalanuvchilar topilmadi</p>
              <p className="text-gray-400 text-sm mt-2">Foydalanuvchilar mavjud bo'lganda bu yerda ko'rinadi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;