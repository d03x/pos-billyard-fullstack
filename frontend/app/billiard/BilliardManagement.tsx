import { useEffect, useState, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Calendar,
  CheckCircle,
  Clock,
  Coffee,
  Info,
  Table,
  Users,
  XCircle,
} from "lucide-react";
import PageError from "~/components/PageError";
import PageLoading from "~/components/PageLoading";
import * as Card from "~/components/ui/card";
import { getAllBookingHistory, useGetDataTable } from "~/hook/useBilliardData";
import { Button } from "~/components/ui/button";
import { CreateReservationDialog } from "./CreateReservationDialog";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Progress } from "~/components/ui/progress";
import useSWRMutation from "swr/mutation";
import {
  mutationWithData,
  submitExtendReservation,
} from "~/utils/fetcher/submit-reservation";
import { toast } from "react-toastify";
import { formatRupiah } from "~/utils/formatRupiah";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

// ==================== Helper Functions ====================
const useCurrentTime = (updateInterval = 1000) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  //@ts-ignore
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [updateInterval]);

  return currentTime;
};

const calculateTimeProgress = (
  startTime: string,
  endTime: string,
  currentTime: Date
) => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const now = currentTime.getTime();

  if (now >= end) return 100;
  if (now <= start) return 0;

  return Math.min(100, ((now - start) / (end - start)) * 100);
};

const formatCountdown = (endTime: string) => {
  const end = dayjs(endTime);
  const now = dayjs();
  const countdown = dayjs.duration(end.diff(now));

  return `${countdown.hours().toString().padStart(2, "0")}:${countdown
    .minutes()
    .toString()
    .padStart(2, "0")}:${countdown.seconds().toString().padStart(2, "0")}`;
};

const getTableCardColors = (isAvailable: boolean) => {
  return isAvailable
    ? "bg-green-50 border-green-300 relative after:content-[''] after:absolute after:top-0 after:right-0 after:w-1 after:h-full after:bg-gradient-to-b after:from-green-200 after:to-green-300"
    : "bg-red-50 border-red-100 relative after:content-[''] after:absolute after:top-0 after:right-0 after:w-1 after:h-full after:bg-gradient-to-b after:from-red-200 after:to-red-300";
};

// ==================== Sub-Components ====================
const BookingStatusBadge = ({ progress }: { progress: number }) => (
  <Badge variant={progress >= 100 ? "destructive" : "default"}>
    {progress >= 100 ? "EXPIRED" : "ACTIVE"}
  </Badge>
);

const CustomerInfoSection = ({ booking }: { booking: any }) => (
  <div className="space-y-2">
    <h4 className="font-medium flex items-center gap-2">
      <Users size={16} />
      Customer Information
    </h4>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Name</p>
        <p>{booking.customer_name}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Status</p>
        <Badge
          variant={booking.status === "Reserved" ? "secondary" : "default"}
        >
          {booking.status}
        </Badge>
      </div>
    </div>
  </div>
);

const BookingDetailsSection = ({ booking }: { booking: any }) => (
  <div className="space-y-2">
    <h4 className="font-medium flex items-center gap-2">
      <Clock size={16} />
      Booking Details
    </h4>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Start Time</p>
        <p>{format(new Date(booking.startTime), "PPp", { locale: id })}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">End Time</p>
        <p>{format(new Date(booking.endTime), "PPp", { locale: id })}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Duration</p>
        <p>{booking.durationHours} hours</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Total Price</p>
        <p>Rp{booking.totalPrice}</p>
      </div>
    </div>
  </div>
);

const HistoryItem = ({ item }: { item: any }) => {
  const isCurrent = item.status === "InProgress";
  return (
    <div
      className={`flex items-center border border-gray-200 justify-between p-3 ${
        isCurrent ? "bg-red-50" : "bg-gray-50"
      } rounded-lg`}
    >
      <div className="flex items-center gap-3">
        {item.status === "Completed" ? (
          <Calendar className="h-4 w-4 text-blue-500" />
        ) : (
          <Coffee className="h-4 w-4 text-orange-500" />
        )}
        <div>
          <p className="text-sm font-medium">{item.customer_name}</p>
          <p className="text-xs text-gray-600">
            {format(new Date(item.createdAt), "PPp", { locale: id })} - Durasi{" "}
            {item.durationHours} Jam
          </p>
        </div>
      </div>
      <Badge variant="outline" className="text-xs">
        {item.status}
      </Badge>
    </div>
  );
};

// ===================== HISTORY SECTION ==================

const BookingHistorySection = ({ history }: { history?: any[] }) => {
  const [visibleItems, setVisibleItems] = useState(5); // Show 5 items initially
  const itemsPerLoad = 5; // Number of items to load each time

  // Sort and memoize history data
  const sortedHistory = useMemo(() => {
    return history?.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) || [];
  }, [history]);

  const hasMoreItems = sortedHistory.length > visibleItems;

  const loadMore = () => {
    setVisibleItems(prev => prev + itemsPerLoad);
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      <h4 className="font-medium flex items-center gap-2">
        <Clock size={16} />
        Riwayat
      </h4>

      {sortedHistory.length === 0 ? (
        <p className="text-sm border border-gray-100 p-2 rounded-lg text-center">
          Tidak ada history pada meja ini
        </p>
      ) : (
        <>
          {sortedHistory.slice(0, visibleItems).map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
          
          {hasMoreItems && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80 mt-2"
              onClick={loadMore}
            >
              View More
            </Button>
          )}
        </>
      )}
    </div>
  );
};

// ==================== Main Component ====================
export default function BilliardManagement() {
  const { data, isLoading, error } = useGetDataTable();
  const [extendDuration, setExtendDuration] = useState(1);
  const currentTime = useCurrentTime();
  const endSessionRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  const { trigger: extendTrigger, isMutating: isExtending } = useSWRMutation(
    "/api/pool-tables/booking/extend-time",
    submitExtendReservation
  );
  const { data: dataHistory } = getAllBookingHistory();
  const sortedHistory = useMemo(() => {
    return dataHistory?.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [dataHistory]);
  const { trigger: endSessionTrigger } = useSWRMutation(
    "/api/pool-tables/booking/end-session",
    mutationWithData
  );

  const handleEndSession = async (bookingId: number) => {
    try {
      await endSessionTrigger({ bookingId });
      window.location.reload();
      toast.success("Session ended successfully");
    } catch (err) {
      console.error("Failed to end session:", err);
      toast.error("Failed to end session");
    }
  };

  const handleExtendSession = async (bookingId: number, hours: number) => {
    if (confirm("Apakah yakin?")) {
      try {
        await extendTrigger({ bookingId, hours });
        window.location.reload();
        toast.success("Berhasil memperpanjang waktu");
      } catch (err) {
        console.error("Failed to extend session:", err);
        toast.error("Failed to extend session");
      }
    }
  };

  const setupEndSessionTrigger = (bookingId: number, endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = currentTime.getTime();
    const timeLeft = end - now;

    if (timeLeft > 0 && !endSessionRef.current[bookingId]) {
      endSessionRef.current[bookingId] = setTimeout(() => {
        handleEndSession(bookingId);
        delete endSessionRef.current[bookingId];
      }, timeLeft);
    }
  };

  if (isLoading) return <PageLoading />;
  if (error) return <PageError error={error} />;

  return (
    <div className="grid grid-cols-1 gap-5">
      <Card.Card>
        <Card.CardHeader>
          <Card.CardTitle>Table Overview</Card.CardTitle>
          <Card.CardDescription>
            Current status of all billiard tables
          </Card.CardDescription>
          <Card.CardAction>
            <CreateReservationDialog data={data} />
          </Card.CardAction>
        </Card.CardHeader>
        <Card.CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {data.map((item: any) => (
              <TableCard
                key={item.id}
                item={item}
                currentTime={currentTime}
                onSetupEndSession={setupEndSessionTrigger}
                onExtendSession={handleExtendSession}
                onEndSession={handleEndSession}
                extendDuration={extendDuration}
                onExtendDurationChange={setExtendDuration}
              />
            ))}
          </div>
        </Card.CardContent>
      </Card.Card>
      <Card.Card>
        <Card.CardHeader>
          <Card.CardTitle>Activity</Card.CardTitle>
          <Card.CardDescription>History Pesanan</Card.CardDescription>
        </Card.CardHeader>
        <Card.CardContent>
          <BookingHistorySection history={sortedHistory}/>
        </Card.CardContent>
      </Card.Card>
    </div>
  );
}

// ==================== Table Card Component ====================
const TableCard = ({
  item,
  currentTime,
  onSetupEndSession,
  onExtendSession,
  onEndSession,
  extendDuration,
  onExtendDurationChange,
}: {
  item: any;
  currentTime: Date;
  onSetupEndSession: (bookingId: number, endTime: string) => void;
  onExtendSession: (bookingId: number, hours: number) => void;
  onEndSession: (bookingId: number) => void;
  extendDuration: number;
  onExtendDurationChange: (value: number) => void;
}) => {
  const isAvailable = item.isAvailable;
  const activeBooking = item.PoolBookings;
  const cardColors = getTableCardColors(isAvailable);

  useEffect(() => {
    if (!isAvailable && activeBooking) {
      onSetupEndSession(activeBooking.id, activeBooking.endTime);
    }
  }, [isAvailable, activeBooking, onSetupEndSession]);

  const progress = useMemo(
    () =>
      activeBooking
        ? calculateTimeProgress(
            activeBooking.startTime,
            activeBooking.endTime,
            currentTime
          )
        : 0,
    [activeBooking, currentTime]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card.Card
          className={`shadow-none cursor-pointer rounded-xs overflow-hidden ${cardColors}`}
        >
          <Card.CardHeader className="flex justify-between items-start pb-2">
            <div>
              <Card.CardTitle className="text-base font-semibold text-gray-800">
                {item.name}
              </Card.CardTitle>
              <Card.CardDescription className="text-xs text-gray-500">
                {item.status}
                {!isAvailable && activeBooking && (
                  <>
                    <span className="block text-xs mt-1">
                      {activeBooking.customer_name}
                    </span>
                    <div className="mt-1">
                      <Progress value={progress} className="h-1" />
                      <span className="text-xs">
                        {formatCountdown(activeBooking?.endTime)}
                      </span>
                    </div>
                  </>
                )}
              </Card.CardDescription>
            </div>
            <div className="rounded-full p-2">
              {isAvailable ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <XCircle size={20} className="text-red-500" />
              )}
            </div>
          </Card.CardHeader>
        </Card.Card>
      </DialogTrigger>

      <TableDialogContent
        item={item}
        activeBooking={activeBooking}
        isAvailable={isAvailable}
        progress={progress}
        extendDuration={extendDuration}
        onExtendDurationChange={onExtendDurationChange}
        onExtendSession={onExtendSession}
        onEndSession={onEndSession}
      />
    </Dialog>
  );
};

// ==================== Table Dialog Content ====================
const TableDialogContent = ({
  item,
  activeBooking,
  isAvailable,
  progress,
  extendDuration,
  onExtendDurationChange,
  onExtendSession,
  onEndSession,
}: {
  item: any;
  activeBooking: any;
  isAvailable: boolean;
  progress: number;
  extendDuration: number;
  onExtendDurationChange: (value: number) => void;
  onExtendSession: (bookingId: number, hours: number) => void;
  onEndSession: (bookingId: number) => void;
}) => (
  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Table size={20} />
        {item.name}
      </DialogTitle>
      <DialogDescription>
        {item.status} • Hourly Rate: {formatRupiah(item.hourly_rate)}
      </DialogDescription>
    </DialogHeader>

    {!isAvailable && activeBooking ? (
      <ActiveBookingContent
        booking={activeBooking}
        progress={progress}
        extendDuration={extendDuration}
        onExtendDurationChange={onExtendDurationChange}
        onExtendSession={onExtendSession}
        onEndSession={onEndSession}
      />
    ) : (
      <AvailableTableContent item={item} />
    )}

    <Separator />
    <HistorySection history={item?.history} />
  </DialogContent>
);

// ==================== Active Booking Content ====================
const ActiveBookingContent = ({
  booking,
  progress,
  extendDuration,
  onExtendDurationChange,
  onExtendSession,
  onEndSession,
}: {
  booking: any;
  progress: number;
  extendDuration: number;
  onExtendDurationChange: (value: number) => void;
  onExtendSession: (bookingId: number, hours: number) => void;
  onEndSession: (bookingId: number) => void;
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Clock size={16} />
          Time Remaining: {formatCountdown(booking.endTime)}
        </h4>
        <BookingStatusBadge progress={progress} />
      </div>
      <Progress value={progress} className="h-2" />
    </div>

    <CustomerInfoSection booking={booking} />
    <Separator />
    <BookingDetailsSection booking={booking} />

    {booking.notes && (
      <>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">Notes</p>
          <p>{booking.notes}</p>
        </div>
      </>
    )}

    <Separator />

    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          value={extendDuration.toString()}
          onValueChange={(value) => onExtendDurationChange(parseInt(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Extend by" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((hours) => (
              <SelectItem key={hours} value={hours.toString()}>
                +{hours} hour{hours > 1 ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => onExtendSession(booking.id, extendDuration)}
        >
          Extend Session
        </Button>
      </div>

      <Button variant="destructive" onClick={() => onEndSession(booking.id)}>
        End Session
      </Button>
    </div>
  </div>
);

// ==================== Available Table Content ====================
const AvailableTableContent = ({ item }: { item: any }) => (
  <div className="text-center py-8">
    <Info className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">Table Available</h3>
    <p className="mt-1 text-sm text-gray-500">
      This table is currently free for booking
    </p>
    <div className="mt-6">
      <CreateReservationDialog data={[item]} />
    </div>
  </div>
);

// ==================== History Section ====================
const HistorySection = ({ history }: { history?: any[] }) => (
  <div className="grid grid-cols-1 gap-2">
    <h4 className="font-medium flex items-center gap-2">
      <Clock size={16} />
      Riwayat
    </h4>

    {!history || history.length <= 0 ? (
      <p className="text-sm border border-gray-100 p-2 rounded-lg text-center">
        Tidak ada history pada meja ini
      </p>
    ) : (
      history.map((item, index) => <HistoryItem key={index} item={item} />)
    )}
  </div>
);
