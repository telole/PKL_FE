export function useToast() {
  function ensureContainer() {
    let container = document.getElementById("_toast_container_");
    if (!container) {
      container = document.createElement("div");
      container.id = "_toast_container_";
      container.style.position = "fixed";
      container.style.top = "16px";
      container.style.right = "16px";
      container.style.zIndex = "9999";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "8px";
      document.body.appendChild(container);
    }
    return container;
  }

  function toastColor(type) {
    switch (type) {
      case "success":
        return { bg: "#10b981", text: "#ffffff" };
      case "error":
        return { bg: "#ef4444", text: "#ffffff" };
      case "warning":
        return { bg: "#f59e0b", text: "#111827" };
      default:
        return { bg: "#374151", text: "#ffffff" };
    }
  }

  function showNotif(type = "info", message = "") {
    const container = ensureContainer();
    const { bg, text } = toastColor(type);

    const el = document.createElement("div");
    el.setAttribute("role", "status");
    el.style.background = bg;
    el.style.color = text;
    el.style.padding = "10px 12px";
    el.style.borderRadius = "8px";
    el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    el.style.fontSize = "14px";
    el.style.maxWidth = "360px";
    el.style.wordBreak = "break-word";
    el.style.opacity = "0";
    el.style.transform = "translateY(-6px)";
    el.style.transition = "opacity 160ms ease, transform 160ms ease";
    el.textContent = message;

    container.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });

    const hide = () => {
      el.style.opacity = "0";
      el.style.transform = "translateY(-6px)";
      setTimeout(() => {
        if (container.contains(el)) container.removeChild(el);
        if (!container.childElementCount) container.remove();
      }, 180);
    };

    const autoClose = setTimeout(hide, 3200);
    el.addEventListener("click", () => {
      clearTimeout(autoClose);
      hide();
    });
  }

  return { showNotif };
}

