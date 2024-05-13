import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { queryClient } from "./client";

export type Domain = {
  id: string;
  host: string;
  credentials: string;
};

const domainsQueryKey = "domains";

const getDomains = async (): Promise<Domain[]> => {
  const response = await axios.get("/domains");
  return response.data;
};

export const useDomains = () => {
  return useQuery({ queryKey: [domainsQueryKey], queryFn: getDomains });
};

const createDomain = async (domain: Omit<Domain, "id">): Promise<Domain> => {
  const response = await axios.post("/domains", domain);
  return response.data;
};

export const useCreateDomain = () => {
  return useMutation({
    mutationFn: createDomain,
    onSuccess: () => queryClient.invalidateQueries([domainsQueryKey]),
  });
};

const removeDomain = async (domainId?: string): Promise<void> => {
  await axios.delete(`/domains/${domainId}`);
};

export const useRemoveDomain = (domainId?: string) => {
  return useMutation({
    mutationFn: () => removeDomain(domainId),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
