"use client";

import AddEvent from "@/components/add-event";
import EventsTable from "@/components/tables/events";
import EventsSkeleton from "@/components/tables/events-skeleton";
import UserNav from "@/components/user-nav";
import { Event } from "@/data/events/schema";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TronWeb } from "tronweb";

export interface Organizer {
  address: string;
  name: string;
  photoUrl: string;
  createdAt: Date;
}

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = () => {
    const address = ((window as any).tronWeb as TronWeb)?.defaultAddress
      ?.base58;
    if (!address) return false;

    let token = localStorage.getItem("authToken") !== null;
    if (!token) return false;

    return true;
  };
  const getEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/events");
      setEvents(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/auth");
    }
    getEvents();
  }, []);
  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your events
            </p>
          </div>
          <div className="flex justify-between items-center space-x-2">
            <AddEvent onClose={async () => await getEvents()} />
            <UserNav />
          </div>
        </div>
        {loading ? <EventsSkeleton /> : <EventsTable events={events} />}
      </div>
    </>
  );
}
