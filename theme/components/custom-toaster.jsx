import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import useCheckAnnouncementBar from "../helper/hooks/useCheckAnnouncementBar";

// Toast Context
const ToastContext = createContext();

// Toast types
const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

// Toast positions
const TOAST_POSITIONS = {
  TOP_LEFT: "top-left",
  TOP_CENTER: "top-center",
  TOP_RIGHT: "top-right",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_CENTER: "bottom-center",
  BOTTOM_RIGHT: "bottom-right",
};

// Default configuration
const DEFAULT_CONFIG = {
  duration: 3000,
  position: TOAST_POSITIONS.TOP_RIGHT,
  maxToasts: 5,
};

// Toast Provider Component
export const ToastProvider = ({ children, config = {} }) => {
  const [toasts, setToasts] = useState([]);
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Add toast function
  const addToast = useCallback(
    (message, type = TOAST_TYPES.INFO, options = {}) => {
      const id = Date.now() + Math.random();
      const toast = {
        id,
        message,
        type,
        duration: options.duration || finalConfig.duration,
        position: options.position || finalConfig.position,
        ...options,
      };

      setToasts((prev) => {
        const newToasts = [toast, ...prev];
        // Limit number of toasts
        return newToasts.slice(0, finalConfig.maxToasts);
      });

      // Auto remove toast
      if (toast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration);
      }

      return id;
    },
    [finalConfig]
  );

  // Remove toast function
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Toast methods
  const toast = {
    success: (message, options) =>
      addToast(message, TOAST_TYPES.SUCCESS, options),
    error: (message, options) => addToast(message, TOAST_TYPES.ERROR, options),
    info: (message, options) => addToast(message, TOAST_TYPES.INFO, options),
    warning: (message, options) =>
      addToast(message, TOAST_TYPES.WARNING, options),
    custom: (message, options) => addToast(message, "custom", options),
    remove: removeToast,
    clear: clearAllToasts,
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
  // Group toasts by position
  const groupedToasts = toasts.reduce((acc, toast) => {
    const position = toast.position || TOAST_POSITIONS.TOP_CENTER;
    if (!acc[position]) acc[position] = [];
    acc[position].push(toast);
    return acc;
  }, {});

  const { hasAnnouncementBar } = useCheckAnnouncementBar();

  const topPosition = hasAnnouncementBar ? "mt-[80px]" : "mt-[56px]";

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`absolute flex flex-col gap-0 md:w-[704px] w-full ${getPositionClasses(position)} ${topPosition}`}
        >
          {positionToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </div>
      ))}
    </div>
  );
};

// Individual Toast Item Component
const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles =
      "pointer-events-auto transform transition-all duration-300 ease-in-out";
    const visibilityStyles =
      isVisible && !isExiting
        ? "translate-y-0 opacity-100"
        : "translate-y-[-100%] opacity-0";

    return `${baseStyles} ${visibilityStyles} md:ml-0 md:mr-0 ml-2 mr-2`;
  };

  const getToastTypeStyles = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return "bg-neutral-dark text-black"; // Matching your design color
      case TOAST_TYPES.ERROR:
        return "bg-ekke-brown text-white";
      case TOAST_TYPES.WARNING:
        return "bg-neutral-dark text-black";
      case TOAST_TYPES.INFO:
        return "bg-neutral-dark text-black";
      default:
        return "bg-neutral-dark text-black"; // Default to your design color
    }
  };

  return (
    <div className={getToastStyles()}>
      <div
        className={`
          ${getToastTypeStyles()}
          md:max-w-[704px]
          max-w-full
          px-[10px] py-4 md:px-6 md:py-4
          flex items-center justify-between
          font-normal text-sm
          h-10
          ${toast.className || ""}
        `}
      >
        <div className="flex items-center gap-3">
          {/* Message */}
          <span className="font-normal tracking-wide uppercase text-xs">
            {toast.message}
          </span>
        </div>
      </div>
    </div>
  );
};

// Position utility function
const getPositionClasses = (position) => {
  switch (position) {
    case TOAST_POSITIONS.TOP_LEFT:
      return "top-0 left-0";
    case TOAST_POSITIONS.TOP_CENTER:
      return "top-0 left-[50%]";
    case TOAST_POSITIONS.TOP_RIGHT:
      return "top-0 right-0";
    case TOAST_POSITIONS.BOTTOM_LEFT:
      return "bottom-0 left-0";
    case TOAST_POSITIONS.BOTTOM_CENTER:
      return "bottom-0 left-[50%]";
    case TOAST_POSITIONS.BOTTOM_RIGHT:
      return "bottom-0 right-0";
    default:
      return "top-0 right-0";
  }
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
};

// Export constants for easy use
export { TOAST_TYPES, TOAST_POSITIONS };

// Default export
export default ToastProvider;
