import useSWR from "swr";
import { api_url } from "~/utils/api";
import fetcher from "~/utils/fetcher";

export const useGetDataTable = () => {
  const { data, isLoading, error } = useSWR(
    `${api_url}/api/pool-tables`,
    fetcher
  );
  return {
    data,
    isLoading,
    error,
  };
};
export const getAllBookingHistory = ()=>{
  const { data, isLoading, error } = useSWR(
    `${api_url}/api/pool/get-all-bookings`,
    fetcher
  );
  return {
    data,
    isLoading,
    error
  } as {
    data : any
  }
}