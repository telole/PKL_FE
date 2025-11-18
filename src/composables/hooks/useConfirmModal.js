import { useState, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";

export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: "Konfirmasi",
    message: "Apakah Anda yakin?",
    onConfirm: null,
    confirmText: "Ya",
    cancelText: "Batal",
    variant: "default", // default, danger, warning
  });

  const confirm = useCallback((message, onConfirm, options = {}) => {
    setConfig({
      title: options.title || "Konfirmasi",
      message: message || "Apakah Anda yakin?",
      onConfirm: onConfirm || (() => {}),
      confirmText: options.confirmText || "Ya",
      cancelText: options.cancelText || "Batal",
      variant: options.variant || "default",
    });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (config.onConfirm) {
      config.onConfirm();
    }
    close();
  }, [config, close]);

  const ConfirmModal = () => {
    if (!isOpen) return null;

    const variantStyles = {
      default: {
        button: "bg-blue-600 hover:bg-blue-700 text-white",
        icon: "text-blue-600",
      },
      danger: {
        button: "bg-red-600 hover:bg-red-700 text-white",
        icon: "text-red-600",
      },
      warning: {
        button: "bg-yellow-600 hover:bg-yellow-700 text-white",
        icon: "text-yellow-600",
      },
    };

    const styles = variantStyles[config.variant] || variantStyles.default;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={close}>
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={close}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 mb-4">
            <div className={`${styles.icon} flex-shrink-0`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {config.title}
              </h3>
              <p className="text-gray-600 text-sm">{config.message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={close}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              {config.cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${styles.button}`}
            >
              {config.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return {
    confirm,
    close,
    isOpen,
    ConfirmModal,
  };
}

