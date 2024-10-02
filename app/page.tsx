"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TronWeb } from "tronweb";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = () => {
    const address = ((window as any).tronWeb as TronWeb).defaultAddress.base58;
    let token = localStorage.getItem("authToken") !== null;
    if (!address && !token) return false;

    return true;
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/auth");
    }
  });
  return <div> Home</div>;
}
