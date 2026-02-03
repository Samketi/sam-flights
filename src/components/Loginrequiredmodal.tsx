// src/components/LoginRequiredModal.tsx
import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { X, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginRequiredModal: FC<LoginRequiredModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <LogIn className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Login Required
              </h2>

              {/* Message */}
              <p className="text-gray-600 text-center mb-6">
                You need to be logged in before you can book a flight. Please
                log in or create an account to continue.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Go to Login
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginRequiredModal;
