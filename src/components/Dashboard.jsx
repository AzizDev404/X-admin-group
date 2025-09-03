import React, { useState, useEffect } from 'react';
import { FiTrash2, FiLogOut, FiUsers, FiRefreshCw, FiCheck } from 'react-icons/fi';
import Alert from './Alert';
import logo from '../assets/usat.png';

const Dashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '', showConfirm: false });
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [checkingUserId, setCheckingUserId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL

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
      console.error('API ga ulanib bo\'lmadi:', error.message);
      setAlert({ type: 'error', message: 'API\'ga ulanib bo\'lmadi. Sahifani yangilab ko\'ring.', showConfirm: false });
      setUsers([]);
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
      setAlert({ type: 'error', message: 'Foydalanuvchini tasdiqlashda xatolik yuz berdi.', showConfirm: false });
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
      setAlert({ type: 'error', message: 'Foydalanuvchini o\'chirishda xatolik yuz berdi.', showConfirm: false });
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
      <div className="flex items-center justify-center space-x-2">
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <div>
                <img
                  src={logo}
                  alt="Workflow"
                  className="h-8 w-auto"
                />
              </div>
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
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-blue-500">
              Foydalanuvchilar ({users.length})
            </h2>
          </div>

          {/* Table - Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foydalanuvchi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telegram ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sinf/Guruh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ota/Ona ma'lumotlari
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Til
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holat
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">ID: {user._id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {user.telegram_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.class && user.group ? `${user.class}-${user.group}` : 'Belgilanmagan'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>
                          {user.student_parrent === 'Father' ? 'Ota' : 
                           user.student_parrent === 'Mother' ? 'Ona' : 
                           'Belgilanmagan'}
                        </div>
                        <div className="text-gray-500">{user.parnet_full_name || 'Belgilanmagan'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.phone_number || 'Belgilanmagan'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.language === 'uz' ? "O'zbek" : user.language === 'ru' ? 'Rus' : 'Belgilanmagan'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user.checked 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.checked ? 'Tasdiqlangan' : 'Kutilmoqda'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {renderActionButtons(user)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet View - Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user._id} className="p-6">
                <div className="flex flex-col space-y-4">
                  {/* Header: Name, Status and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                      <p className="text-sm text-gray-500">ID: {user._id}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-3">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Telegram ID</span>
                      <span className="text-sm text-gray-900 font-mono">{user.telegram_id}</span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Sinf/Guruh</span>
                      <span className="text-sm text-gray-900">
                        {user.class && user.group ? `${user.class}-${user.group}` : 'Belgilanmagan'}
                      </span>
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