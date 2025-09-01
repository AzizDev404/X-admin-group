import React, { useEffect } from 'react';
import { FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';

const Alert = ({ type, message, onClose, onConfirm, showConfirm = false }) => {
  useEffect(() => {
    if (message && !showConfirm) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose, showConfirm]);

  if (!message) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"></div>
      
      {/* Alert Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`w-full max-w-md bg-white rounded-2xl shadow-2xl border transition-all duration-300 transform ${
            showConfirm ? 'border-red-200' : 
            type === 'success' ? 'border-green-200' : 'border-red-200'
          } animate-fade-in`}
          style={{
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                showConfirm ? 'bg-red-100' :
                type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {showConfirm ? (
                  <FiAlertTriangle className={`w-8 h-8 text-red-600`} />
                ) : type === 'success' ? (
                  <FiCheck className="w-8 h-8 text-green-600" />
                ) : (
                  <FiX className="w-8 h-8 text-red-600" />
                )}
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {showConfirm ? 'Tasdiqlang' : 
                 type === 'success' ? 'Muvaffaqiyat!' : 'Xatolik!'}
              </h3>
              <p className="text-gray-600">{message}</p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              {showConfirm ? (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Ha, o'chirish
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Yopish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Alert;