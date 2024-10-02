import { AuthCard } from "@/components/AuthCard";
import Image from "next/image";

export default function Authentication() {
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
