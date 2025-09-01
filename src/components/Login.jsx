import React, { useState } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiUsers } from 'react-icons/fi';

const Alert = ({ type, message, onClose }) => {
  if (!message) return null;
  
  const alertStyles = {
    success: 'bg-white border-blue-500 text-black shadow-lg',
    error: 'bg-white border-red-500 text-black shadow-lg',
    warning: 'bg-white border-yellow-500 text-black shadow-lg'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border-2 ${alertStyles[type]} max-w-sm shadow-xl`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 text-gray-600 hover:text-black transition-colors duration-200">
          ×
        </button>
      </div>
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Get API URL from environment
  const API_URL = import.meta.env?.VITE_API_URL || '';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      setAlert({ type: 'error', message: 'Iltimos, barcha maydonlarni to\'ldiring' });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        const credentials = btoa(`${formData.username}:${formData.password}`);
        localStorage.setItem('adminCredentials', credentials);
        
        setAlert({ type: 'success', message: 'Muvaffaqiyatli kirdingiz!' });
        setTimeout(() => onLogin(), 500);
      } else {
        setAlert({ type: 'error', message: data.message || 'Kirish amalga oshmadi' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Tarmoq xatosi yoki noto\'g\'ri ma\'lumotlar' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: '', message: '' })}
      />
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-200 p-8 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500"></div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-6 shadow-xl border-4 border-white">
              <FiUsers className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Admin Panel</h1>
            <p className="text-black opacity-75">Davom etish uchun ma'lumotlaringizni kiriting</p>
          </div>

          <div className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">
                Foydalanuvchi nomi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-black bg-white hover:border-blue-300"
                  placeholder="Foydalanuvchi nomini kiriting"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">
                Parol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="block w-full pl-12 pr-14 py-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-black bg-white hover:border-blue-300"
                  placeholder="Parolni kiriting"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 transition-colors duration-300"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-blue-500 hover:text-blue-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-blue-500 hover:text-blue-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform border-2 ${
                isLoading
                  ? 'bg-gray-300 border-gray-300 cursor-not-allowed opacity-70 text-black'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-blue-600 hover:border-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-30 hover:scale-105 hover:shadow-xl active:scale-95 shadow-lg'
              } text-white`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Kirish...
                </div>
              ) : (
                'Kirish'
              )}
            </button>
          </div>

          {/* Bottom decorative line */}
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;