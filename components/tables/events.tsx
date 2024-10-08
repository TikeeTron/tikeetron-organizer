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
import UseTicketDialog from "../use-ticket-dialog";

interface EventsTableProps {
  events: Event[];
}

export default function EventsTable({ events }: EventsTableProps) {
  return events.length > 0 ? (
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
              <UseTicketDialog />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter></TableFooter>
    </Table>
  ) : (
    <div className="flex justify-center items-center h-64">
      <p className="text-muted-foreground">No events found</p>
    </div>
  );
}
