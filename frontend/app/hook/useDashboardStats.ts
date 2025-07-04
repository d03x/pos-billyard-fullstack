import useSWR from "swr";
import { api_url } from "~/utils/api";
import fetcher from "~/utils/fetcher";
import { formatRupiah } from "~/utils/formatRupiah";

interface DashboardStats {
  available: number;
  occupied: number;
  maintenance: number;
  totalRevenue: number;
  activeBookings: number;
  recentBookings: any[];
  hourlyUsage: {
    hour: string;
    bookings: number;
  }[];
}

export function useDashboardStats() {
  const { data, error, isLoading } = useSWR<DashboardStats>(
    `${api_url}/api/stats/dashboard`,
    fetcher
  );

  // Format the data for display
  const formattedData = data
    ? {
        ...data,
        totalRevenueFormatted: formatRupiah(data.totalRevenue),
        recentBookings:
          data.recentBookings?.map((booking) => ({
            ...booking,
            formattedTime: new Date(booking.createdAt).toLocaleTimeString(),
            formattedDate: new Date(booking.createdAt).toLocaleDateString(),
          })) || [],
      }
    : null;

  return {
    stats: formattedData,
    isLoading,
    error,
  };
}

interface RevenueData {
  date: string;
  revenue: number;
}

export function useRevenueStats(period: "day" | "week" | "month" = "day") {
  return useSWR<RevenueData[]>(`${api_url}/api/stats/revenue?period=${period}`,fetcher);
}

interface TableUtilization {
  tableId: number;
  tableName: string;
  totalHours: number;
  utilizationRate: number;
  bookingsCount: number;
}

export function useTableUtilization(days: number = 7) {
  return useSWR<TableUtilization[]>(
    `${api_url}/api/stats/utilization?days=${days}`,fetcher
  );
}
