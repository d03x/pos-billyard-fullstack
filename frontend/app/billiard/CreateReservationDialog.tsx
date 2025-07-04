import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useState, useEffect } from "react";
import useSWRMutation from "swr/mutation";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { submitReservation } from "~/utils/fetcher/submit-reservation";
import { formatRupiah } from "~/utils/formatRupiah";
import { Calendar, PlusCircle } from "lucide-react";
import { TimePicker } from "../components/TimePicker"; // Komponen baru untuk memilih waktu
import { useSWRConfig } from "swr";
import { api_url } from "~/utils/api";

dayjs.extend(duration);

type Table = {
  id: number;
  name: string;
  hourly_rate: number;
  isAvailable: boolean;
};

export const CreateReservationDialog = ({ data }: { data: Table[] }) => {
  const [customerName, setCustomerName] = useState("");
  const [tableId, setTableId] = useState<number | null>(null);
  const [durationHours, setDurationHours] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(dayjs().add(1, "hour"));

  const { trigger, isMutating } = useSWRMutation(
    "/api/create-booking",
    submitReservation
  );
  const { mutate } = useSWRConfig();
  // Inisialisasi waktu saat dialog dibuka
  useEffect(() => {
    if (open) {
      const now = dayjs();
      const roundedMinutes = Math.round(now.minute() / 5) * 5;
      const currentTime = now.minute(roundedMinutes).second(0);

      setStartTime(currentTime);
      setEndTime(currentTime.add(durationHours, "hour"));
      setIsCustomTime(false);
    }
  }, [open, durationHours]);

  const handleDurationChange = (hours: number) => {
    setDurationHours(hours);
    setEndTime(startTime.add(hours, "hour"));
  };

  const handleStartTimeChange = (newTime: dayjs.Dayjs) => {
    setStartTime(newTime);
    setEndTime(newTime.add(durationHours, "hour"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName) {
      setError("Nama pelanggan harus diisi");
      return;
    }

    if (!tableId) {
      setError("Meja harus dipilih");
      return;
    }

    if (startTime.isBefore(dayjs(), "minute")) {
      setError("Waktu mulai tidak boleh lebih awal dari sekarang");
      return;
    }

    const selectedTable = data.find((table) => table.id === tableId);

    if (!selectedTable?.isAvailable) {
      setError("Meja yang dipilih tidak tersedia");
      return;
    }

    try {
      await trigger({
        customer_name: customerName,
        tableId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationHours,
        hourlyRate: selectedTable.hourly_rate,
        notes,
      });

      // Reset form
      setCustomerName("");
      setTableId(null);
      setDurationHours(1);
      setNotes("");
      setError("");
      setOpen(false);
      mutate(`${api_url}/api/pool-tables`);
    } catch (err) {
      setError(
        "Gagal membuat reservasi: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const availableTables = data.filter((table) => table.isAvailable);
  const selectedTable = tableId ? data.find((t) => t.id === tableId) : null;
  const totalPrice = selectedTable
    ? selectedTable.hourly_rate * durationHours
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="text-sm gap-2">
          <PlusCircle size={16} />
          Buat Reservasi Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <Calendar size={18} />
            Reservasi Meja
          </DialogTitle>
          <DialogDescription className="text-sm">
            Isi formulir untuk membuat reservasi baru
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-sm font-medium">
              Nama Pelanggan *
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama lengkap pelanggan"
              className="text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="table" className="text-sm font-medium">
              Pilih Meja *
            </Label>
            <Select
              onValueChange={(value) => setTableId(Number(value))}
              required
              value={tableId?.toString() || ""}
            >
              <SelectTrigger className="text-sm w-full">
                <SelectValue placeholder="Pilih meja yang tersedia" />
              </SelectTrigger>
              <SelectContent>
                {availableTables.length > 0 ? (
                  availableTables.map((table) => (
                    <SelectItem
                      key={table.id}
                      value={table.id.toString()}
                      className="text-sm"
                    >
                      {table.name} - {formatRupiah(table.hourly_rate)}/jam
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled className="text-sm">
                    Tidak ada meja yang tersedia
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Waktu Mulai *</Label>
              {isCustomTime ? (
                <TimePicker
                  value={startTime}
                  onChange={handleStartTimeChange}
                  onBlur={() => {
                    if (startTime.isSame(dayjs(), "hour")) {
                      setIsCustomTime(false);
                    }
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="p-2 text-sm border rounded-md bg-muted/50 flex-1">
                    {startTime.format("DD/MM/YYYY HH:mm")}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCustomTime(true)}
                  >
                    Ubah
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Durasi *</Label>
              <Select
                onValueChange={(value) => handleDurationChange(Number(value))}
                value={durationHours.toString()}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Pilih durasi" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((hours) => (
                    <SelectItem
                      key={hours}
                      value={hours.toString()}
                      className="text-sm"
                    >
                      {hours} jam
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Waktu Selesai</Label>
            <div className="p-2 text-sm border rounded-md bg-muted/50">
              {endTime.format("DD/MM/YYYY HH:mm")}
            </div>
          </div>

          {tableId && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Harga</Label>
              <div className="p-2 text-sm font-medium border rounded-md bg-muted/50">
                {formatRupiah(totalPrice)}
                <span className="text-muted-foreground ml-2">
                  ({durationHours} jam ×{" "}
                  {formatRupiah(selectedTable?.hourly_rate || 0)})
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Catatan Tambahan
            </Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan khusus (opsional)"
              className="text-sm"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 text-sm"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isMutating}
              className="flex-1 text-sm"
            >
              {isMutating ? "Menyimpan..." : "Simpan Reservasi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
