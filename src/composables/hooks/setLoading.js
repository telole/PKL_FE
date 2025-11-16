import { useState } from "react";

export function useSetLoading(initialValue = false) {
  const [loading, setLoading] = useState(initialValue);

  return [loading, setLoading];
}

