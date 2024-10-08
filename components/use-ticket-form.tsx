import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { z } from "zod";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { TronWeb } from "tronweb";
import abi from "@/data/abi.json";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/utils";

const schema = z.object({
  ticketId: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        return parseInt(val);
      }
      return val;
    })
    .refine((val) => !isNaN(val), {
      message: "ticketId must be a valid number",
    }),
});

type FormData = z.infer<typeof schema>;

interface UseTicketFormProps {
  onSuccess: () => void;
}

export default function UseTicketForm({ onSuccess }: UseTicketFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const tronweb: TronWeb = (window as any).tronWeb;
      const contract = tronweb.contract(
        abi,
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
      );

      await contract.useTicket(data.ticketId).send({
        shouldPollResponse: true,
        pollTimes: 30,
      });

      await api.patch(`/v1/tickets/${data.ticketId}`, {
        isUsed: true,
      });
      toast({
        title: "Ticket used",
        description: `Ticket with ID ${data.ticketId} has been used`,
      });
      onSuccess();
    } catch (err) {
      toast({
        title: "Error",
        description: "Error using ticket",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="ticketId"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>
                  Ticket ID
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter ticket ID"
                    type="number"
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        ></FormField>
        <div className="flex justify-between mt-2">
          <p className="text-xs text-red-500">
            This can take ~ 1 minutes to process
          </p>
          {loading ? (
            <Button className="my-2" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button type="submit" className="my-2">
              Submit
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
