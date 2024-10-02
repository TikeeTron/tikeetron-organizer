"use client";

import EventsTable from "@/components/tables/events";
import UserNav from "@/components/user-nav";
import { Event } from "@/data/events/schema";
import api from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TronWeb } from "tronweb";

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const isAuthenticated = () => {
    const address = ((window as any).tronWeb as TronWeb)?.defaultAddress
      ?.base58;
    if (!address) return false;

    let token = localStorage.getItem("authToken") !== null;
    if (!token) return false;

    return true;
  };
  const getEvents = async () => {
    const response = await api.get("/v1/events");

    setEvents(response.data.data);
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/auth");
    }
    getEvents()
  }, []);
  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/tasks-light.png"
          width={1280}
          height={998}
          alt="Playground"
          className="block dark:hidden"
        />
        <Image
          src="/examples/tasks-dark.png"
          width={1280}
          height={998}
          alt="Playground"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
        <EventsTable events={events} />
      </div>
    </>
  );
}
