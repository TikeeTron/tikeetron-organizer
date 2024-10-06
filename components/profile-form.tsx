import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import api from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { TronWeb } from "tronweb";

const schema = z.object({
  name: z.string(),
});

type FormData = z.infer<typeof schema>;

interface ProfileFormProps {
  name: string;
  onSuccess: () => Promise<void>;
}

export default function ProfileForm({ name, onSuccess }: ProfileFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name,
    },
  });
  const { toast } = useToast();
  const onSubmit = async (data: FormData) => {
    try {
      const address = ((window as any).tronWeb as TronWeb)?.defaultAddress
        .base58;
      await api.patch(`/v1/organizers/${address}`, data);

      toast({
        title: "Success",
        description: "Profile updated",
      });
      await onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Organizer" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        ></FormField>
        <div className="flex justify-end">
          <Button type="submit" className="my-2">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
