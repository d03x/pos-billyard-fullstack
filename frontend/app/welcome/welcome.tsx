import { useEffect, useState } from "react"
import { Users, Info } from "lucide-react"
import { Button } from "~/components/ui/button"
import * as Card from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { useGetDataTable } from "~/hook/useBilliardData"

export function Welcome() {
  const { data, isLoading } = useGetDataTable()
  const [now, setNow] = useState(new Date())

  // Optional: Auto-update duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-lg font-semibold">
        Loading meja bilyard...
      </div>
    )
  }

  const formatDuration = (start: string, end?: string): string => {
    const startTime = new Date(start)
    const endTime = end ? new Date(end) : now

    const diffMs = endTime.getTime() - startTime.getTime()
    if (diffMs < 0) return "00:00:00"

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Daftar Meja Bilyard</h1>
        <p className="text-gray-500">Pantau status semua meja bilyard di cafe Anda</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {data.map((item: any) => {
          const isActive = item.status === "BERMAIN"
          const duration = item.startTime
            ? formatDuration(item.startTime, item.endTime)
            : "-"

          return (
            <Card.Card
              key={item.id}
              className="hover:shadow-md transition-shadow border border-gray-200"
            >
              <Card.CardHeader className="flex justify-between items-start pb-2">
                <div>
                  <Card.CardTitle className="text-base font-semibold text-gray-800">
                    #{item.name}
                  </Card.CardTitle>
                  <Card.CardDescription className="text-xs text-gray-500">
                    {isActive ? "Sedang digunakan" : "Tersedia"}
                  </Card.CardDescription>
                </div>
                <div className="rounded-full p-2 bg-gray-100">
                  <Users
                    className={`h-4 w-4 ${
                      isActive ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                </div>
              </Card.CardHeader>

              <Card.CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge
                    variant="outline"
                    className={
                      isActive
                        ? "text-green-700 border-green-300 bg-green-50"
                        : "text-gray-500 bg-gray-100 border-gray-200"
                    }
                  >
                    {isActive ? "Aktif" : "Kosong"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pelanggan:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {item.customer_name || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Durasi:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {duration}
                  </span>
                </div>

                {item.startTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mulai:</span>
                    <span className="text-sm text-gray-700">
                      {new Date(item.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Info className="h-4 w-4" />
                    Lihat Detail
                  </Button>
                </div>
              </Card.CardContent>
            </Card.Card>
          )
        })}
      </div>
    </div>
  )
}
