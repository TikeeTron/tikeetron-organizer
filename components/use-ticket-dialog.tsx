import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Ticket } from "lucide-react";
import UseTicketForm from "./use-ticket-form";

export default function UseTicketDialog() {
  const [useTicketDialogOpen, setUseTicketDialogOpen] = useState(false);
  return (
    <div className="flex">
      <Dialog open={useTicketDialogOpen} onOpenChange={setUseTicketDialogOpen}>
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
          {useTicketDialogOpen && (
            <UseTicketForm onSuccess={() => setUseTicketDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
