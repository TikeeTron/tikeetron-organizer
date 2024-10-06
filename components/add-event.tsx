import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePicker from "@/components/date-picker";
import { useState } from "react";
import { Loader2, MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import api, { cn } from "@/lib/utils";
import { z } from "zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TronWeb } from "tronweb";
import { useToast } from "@/hooks/use-toast";
import abi from "@/data/abi.json";
import { Select } from "@radix-ui/react-select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.date(),
  endDate: z.date(),
  banner: z.instanceof(File).optional(),
  ticketTypes: z
    .array(
      z.object({
        name: z.string().min(1, "Ticket name is required"),
        price: z.string().min(0, "Price must be non-negative"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .min(1, "At least one ticket type is required")
    .max(3, "Maximum 3 ticket types allowed"),
});

type FormData = z.infer<typeof schema>;

interface AddEventProps {
  onClose: () => void;
}

export default function AddEvent({ onClose }: AddEventProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const categories = [
    "Conference",
    "Music",
    "Entertainment",
    "Festival",
    "Fashion",
    "Film",
    "Sports",
    "Art",
    "Convention",
    "Comedy",
  ];
  const method = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticketTypes: [
        {
          name: "",
          price: "0,0",
          quantity: 0,
          startDate: new Date(),
          endDate: new Date(),
        },
      ],
    },
  });
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = method;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ticketTypes",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("banner", file);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const tronWeb = (window as any).tronWeb as TronWeb;
      const contract = tronWeb.contract(
        abi,
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
      );
      const bannerResponse = await api.postForm("/v1/ipfs", {
        banner: data.banner,
        type: "event",
      });

      const response = await api.postForm("/v1/ipfs", {
        eventName: data.name,
        eventDescription: data.description,
        eventCategory: data.category,
        eventLocation: data.location,
        eventStartDate: data.startDate,
        eventEndDate: data.endDate,
        bannerUrl: bannerResponse.data.data,
        organizer: tronWeb.defaultAddress.base58,
        ticketTypes: data.ticketTypes.map((ticketType) => ({
          type: ticketType.name,
          price: parseInt(tronWeb.toSun(parseInt(ticketType.price)).toString()),
          capacity: ticketType.quantity,
          startDate: ticketType.startDate,
          endDate: ticketType.endDate,
        })),
        type: "event",
      });
      const ipfsHash = response.data.data;
      const watchEvent = await contract
        .EventCreated()
        .watch(async (err: unknown, event: any) => {
          if (
            event &&
            event.result.organizer == tronWeb.defaultAddress.base58
          ) {
            await api.post("/v1/events", {
              eventId: parseInt((event as any)?.result.eventId as string),
              name: data.name,
              description: data.description,
              category: data.category,
              location: data.location,
              startDate: new Date(data.startDate),
              endDate: new Date(data.endDate),
              organizer: tronWeb.defaultAddress.base58,
              ticketTypes: data.ticketTypes.map((ticketType) => ({
                type: ticketType.name,
                price: parseInt(
                  tronWeb.toSun(parseInt(ticketType.price)).toString()
                ),
                capacity: ticketType.quantity,
                startDate: new Date(ticketType.startDate),
                endDate: ticketType.endDate,
              })),
              banner: bannerResponse.data.data,
              metadataUrl: ipfsHash,
            });
            toast({
              title: "Success",
              description: "Event created successfully",
            });
            setIsOpen(false);
            onClose();
            watchEvent.stop();
          }
          if (err) {
            toast({
              title: "Error",
              description: "Failed to create event",
            });
            watchEvent.stop();
          }
        });
      await contract
        .createEvent(
          data.name,
          ipfsHash,
          data.startDate.getTime(),
          data.endDate.getTime(),
          data.ticketTypes.map((ticketType) => [
            ticketType.name,
            tronWeb.toSun(parseInt(ticketType.price)),
            ticketType.quantity,
            ticketType.startDate.getTime(),
            ticketType.endDate.getTime(),
          ])
        )
        .send({
          shouldPollResponse: true,
        });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mr-16" onClick={() => setIsOpen(true)}>
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] min-w-[800px] p-0 max-h-[calc(100vh-20%)] overflow-scroll">
        <Form {...method}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader className="p-6">
              <DialogTitle className="text-2xl font-bold">
                Add Event
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Fill in the form below to add a new event
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 p-6 pt-0">
              <div className="flex flex-col gap-1">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <div className="w-full">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        placeholder="World Cup ticket"
                        className="w-full"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <div className="w-full">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="A ticket to the World Cup"
                        className="w-full"
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col w-full items-center gap-4">
                <FormField
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => {
                            return (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location
                </Label>
                <div className="w-full">
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="location"
                        placeholder="Stadium"
                        className="w-full"
                      />
                    )}
                  />
                  {errors.location && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-around">
                <div className="items-center gap-4">
                  <Label htmlFor="date" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <div>
                    <Controller
                      name="startDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      )}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="items-center gap-4">
                  <Label htmlFor="date" className="text-sm font-medium">
                    End Date
                  </Label>
                  <div>
                    <Controller
                      name="endDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      )}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.endDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="banner" className="text-sm font-medium">
                  Image Banner
                </Label>
                <div className="w-full">
                  <Input
                    id="banner"
                    type="file"
                    accept="image/*"
                    className="w-full"
                    onChange={handleFileChange}
                    required={false}
                  />
                  {errors.banner && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.banner.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ticket-types" className="text-sm font-medium">
                    Ticket Types
                  </Label>
                  <div className="flex space-x-2">
                    <PlusCircleIcon
                      size={20}
                      className={cn("text-blue-500 hover:text-blue-600", {
                        "cursor-pointer": fields.length < 3,
                        "opacity-50 cursor-not-allowed": fields.length >= 3,
                      })}
                      onClick={() =>
                        fields.length < 3 &&
                        append({
                          name: "",
                          price: "0.0",
                          quantity: 0,
                          startDate: new Date(),
                          endDate: new Date(),
                        })
                      }
                    />
                    <MinusCircleIcon
                      size={20}
                      className={cn("text-red-500 hover:text-red-600", {
                        "cursor-pointer": fields.length > 1,
                        "opacity-50 cursor-not-allowed": fields.length <= 1,
                      })}
                      onClick={() =>
                        fields.length > 1 && remove(fields.length - 1)
                      }
                    />
                  </div>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Controller
                      name={`ticketTypes.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="VIP"
                          className="flex-1"
                        />
                      )}
                    />
                    <Controller
                      name={`ticketTypes.${index}.price`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="In TRX"
                          className="w-24"
                        />
                      )}
                    />
                    <Controller
                      name={`ticketTypes.${index}.quantity`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          placeholder="Qty"
                          className="w-20"
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(isNaN(value) ? "" : value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name={`ticketTypes.${index}.startDate`}
                      control={control}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        );
                      }}
                    ></Controller>
                    <Controller
                      name={`ticketTypes.${index}.endDate`}
                      control={control}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        );
                      }}
                    ></Controller>
                  </div>
                ))}
                {errors.ticketTypes && (
                  <p className="text-xs text-red-500">
                    {errors.ticketTypes.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="w-full p-4 sticky bottom-0 bg-white">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Add Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
