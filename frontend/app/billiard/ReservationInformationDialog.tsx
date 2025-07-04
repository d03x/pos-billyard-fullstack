import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import dayjs from "dayjs";
import { BadgeInfo, InfoIcon } from "lucide-react";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
} from "~/components/ui/dialog";
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

export const ReservationInformationDialog = ({
  table_id,
  data,
}: {
  data: {
    pricePerHour: number;
  };
  table_id: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <InfoIcon/>
          Lihat Informasi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Informasi Meja</DialogTitle>
          <DialogDescription>
            Isi data reservasi dan klik simpan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
