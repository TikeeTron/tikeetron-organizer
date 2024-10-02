"use client";
import AuthCard from "@/components/auth-card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TronWeb } from "tronweb";

export default function Authentication() {
  const router = useRouter();
  const isAuthenticated = () => {
    const address = ((window as any).tronWeb as TronWeb)?.defaultAddress
      ?.base58;
    if (!address) return false;

    let token = localStorage.getItem("authToken") !== null;
    if (!token) return false;

    return true;
  };

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/");
    }
  });

  return (
    <div className="flex w-full justify-between">
      <div className="w-6/12 h-screen bg-[#0A84FF] flex justify-center items-center">
        <img
          src={"logo.svg"}
          alt="logo"
          className="w-3/12 h-3/12 object-cover"
        />
      </div>
      <AuthCard />
    </div>
  );
}
