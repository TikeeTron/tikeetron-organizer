import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Event } from "@/data/events/schema";
import dayjs from "dayjs";
import { Ticket } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import UseTicketForm from "../use-ticket-form";
import { useState } from "react";

interface EventsTableProps {
  events: Event[];
}

export default function EventsTable({ events }: EventsTableProps) {
  const [useTicketDialogOpen, setUseTicketDialogOpen] = useState(false);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.eventId}>
            <TableCell>{event.eventId}</TableCell>
            <TableCell>{event.name}</TableCell>
            <TableCell>{event.category ?? "-"}</TableCell>
            <TableCell>{dayjs(event.date).format("ddd MMM YYYY")}</TableCell>
            <TableCell>
              <div className="flex">
                <Dialog
                  open={useTicketDialogOpen}
                  onOpenChange={setUseTicketDialogOpen}
                >
                  <DialogTrigger>
                    <Button variant="default">
                      <Ticket className="text-white" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Use Ticket</DialogTitle>
                      <DialogDescription>
                        Insert ticketId to set ticket as used
                      </DialogDescription>
                    </DialogHeader>
                    <UseTicketForm
                      onSuccess={() => setUseTicketDialogOpen(true)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter></TableFooter>
    </Table>
  );
}
