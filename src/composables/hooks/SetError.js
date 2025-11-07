import { useToast } from "./useToast";

export function useSetError() {
  const { showNotif } = useToast();

  /**
   * Extract error message from axios error response
   * @param {Error} err - Axios error object
   * @returns {string} - Formatted error message
   */
  function extractErrorMessage(err) {
    if (!err) return "Terjadi kesalahan yang tidak diketahui.";

    if (err.response) {
      const { data, status } = err.response;

      if (status === 422 && data?.errors) {
        const errorMessages = Object.values(data.errors)
          .flat()
          .join(", ");
        return errorMessages || data.message || "Validasi gagal. Periksa input Anda.";
      }

      if (data?.message) {
        return data.message;
      }

      switch (status) {
        case 401:
          return "Anda tidak memiliki akses. Silakan login kembali.";
        case 403:
          return "Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini.";
        case 404:
          return "Data tidak ditemukan.";
        case 500:
          return "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
        default:
          return data?.error || `Terjadi kesalahan (${status}).`;
      }
    }

    if (err.request) {
      return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
    }

    return err.message || "Terjadi kesalahan yang tidak diketahui.";
  }

  /**
   * Set and display error
   * @param {Error|string} error - Error object or error message string
   * @param {string} fallbackMessage - Optional fallback message if error extraction fails
   */
  function setError(error, fallbackMessage = null) {
    let errorMessage;

    if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = extractErrorMessage(error);
    }

    if (fallbackMessage && (!errorMessage || errorMessage === "Terjadi kesalahan yang tidak diketahui.")) {
      errorMessage = fallbackMessage;
    }

    showNotif("error", errorMessage);

    if (process.env.NODE_ENV === "development") {
      console.error("Error:", error);
    }

    return errorMessage;
  }

  /**
   * Set validation errors (for form errors)
   * @param {Object} errors - Object containing field errors
   * @returns {Object} - Formatted errors object
   */
  function setValidationErrors(errors) {
    if (!errors || typeof errors !== "object") {
      return {};
    }

    // Display first error as notification
    const firstError = Object.values(errors).flat()[0];
    if (firstError) {
      showNotif("error", firstError);
    }

    return errors;
  }

  return {
    setError,
    setValidationErrors,
    extractErrorMessage,
  };
}

