import { useEffect, useMemo, useState } from "react";
import { useGetDataTable } from "~/hook/useBilliardData";
import { useDashboardStats } from "~/hook/useDashboardStats";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatRupiah } from "~/utils/formatRupiah";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Coffee, Wrench, CheckCircle, Activity, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export function Welcome() {
  const {
    data: tables,
    isLoading: tablesLoading,
    error: tablesError,
  } = useGetDataTable();
  const {
    stats: statData,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const stats = useMemo(() => statData as any, [statData]);
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => setIsHydrated(true), []);
  const statCardData = useMemo(() => {
    return stats?.stats;
  }, [stats]);

  if (!isHydrated || statsLoading || tablesLoading) {
    return (
      <div className="p-6 animate-pulse">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Bilyard</h1>
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (statsError || tablesError) {
    return <div className="text-red-500 p-6">Gagal memuat data</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-transparent bg-clip-text">
          Dashboard Bilyard
        </h1>
        <p className="text-gray-500">Pantau semua meja dan aktivitas terkini</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tersedia"
          value={statCardData.availableTables}
          icon={<CheckCircle />}
          color="from-green-400 to-green-600"
        />
        <StatCard
          title="Digunakan"
          value={statCardData.occupiedTables}
          icon={<Coffee />}
          color="from-orange-400 to-orange-600"
        />
        <StatCard
          title="Perbaikan"
          value={statCardData.maintenanceTables}
          icon={<Wrench />}
          color="from-yellow-400 to-yellow-600"
        />
        <StatCard
          title="Pendapatan Hari Ini"
          value={formatRupiah(statCardData.totalRevenue)}
          icon={<Activity />}
          color="from-blue-400 to-indigo-600"
        />
      </div>

      {/* Chart */}
      <Card className="rounded-sm border-none shadow-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Grafik Pemesanan per Jam</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={stats.hourlyUsage}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#008236" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0082366b" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              {/* X Axis with custom styling */}
              <XAxis
                dataKey="hour"
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                tick={{ fill: "#008236", fontSize: 12 }}
                tickFormatter={(value) => `${value}:00`}
              />

              {/* Y Axis with custom styling */}
              <YAxis
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                tick={{ fill: "#008236", fontSize: 12 }}
                width={40}
              />

              {/* Custom Tooltip */}
              <Tooltip
                contentStyle={{
                  background: "rgba(255, 255, 255, 0.96)",
                  border: "1px solid #008236",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#008236",fontSize:12, }}
                labelStyle={{ fontWeight: "bold", color: "#008236" }}
                formatter={(value) => [`${value} pemesanan`, "Jumlah"]}
                labelFormatter={(label) => `Pukul ${label}:00`}
              />

              {/* Grid lines */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />

              {/* Area with smooth animation */}
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#008236"
                strokeWidth={2}
                fill="url(#colorBookings)"
                fillOpacity={1}
                activeDot={{
                  r: 6,
                  stroke: "#8884d8",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" /> Aktivitas Terbaru
        </h2>
        {stats.recentBookings.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            Belum ada aktivitas hari ini
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {stats.recentBookings.map((booking: any) => (
              <Card
                key={booking.id}
                className="hover:shadow-md transition duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {booking.customer_name || "Tanpa Nama"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.poolTable.name.trim()} •{" "}
                        {format(new Date(booking.startTime), "HH:mm", {
                          locale: id,
                        })}{" "}
                        -{" "}
                        {format(new Date(booking.endTime), "HH:mm", {
                          locale: id,
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        booking.status === "Completed"
                          ? "default"
                          : booking.status === "InProgress"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {booking.status === "Completed"
                        ? "Selesai"
                        : booking.status === "InProgress"
                        ? "Berjalan"
                        : "Dipesan"}
                    </Badge>
                  </div>
                  {booking.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold">Catatan:</span>{" "}
                      {booking.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// StatCard component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className={`bg-gradient-to-r ${color} text-white rounded-xl p-4 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm">{title}</h3>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="text-white opacity-90">{icon}</div>
      </div>
    </div>
  );
}
