import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Interaction, InsertInteraction } from "@shared/schema";

export function useInteractions() {
  return useQuery<Interaction[]>({
    queryKey: ["/api/interactions"],
  });
}

export function useUploadInteractions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (interactions: InsertInteraction[]) => {
      const response = await apiRequest("POST", "/api/interactions/bulk", interactions);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interactions"] });
    },
  });
}

export function useClearInteractions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/interactions");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interactions"] });
    },
  });
}
