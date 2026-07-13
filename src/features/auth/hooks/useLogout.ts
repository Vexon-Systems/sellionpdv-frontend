import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { logout as logoutApi } from "@/features/auth/services/apiAuth";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  return async () => {
    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch (error) {
        console.error("Falha ao revogar sessão no servidor:", error);
      }
    }

    queryClient.clear();
    clearAuth();
    navigate({ to: "/login" });
  };
}
