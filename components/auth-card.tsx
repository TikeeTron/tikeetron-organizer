"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/utils";
import { Loader2, Plug } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthCard() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConnectWallet = async () => {
    setLoading(true);
    if ((window as any).tron === undefined) {
      toast({
        title: "Error",
        description: "Please install TronLink to continue",
      });
      return;
    }

    try {
      const address = await (window as any).tron.request({
        method: "eth_requestAccounts",
      });
      const response = await api.post("/v1/auth/sign-in-or-sign-up", {
        address: address[0],
      });
      localStorage.setItem("authToken", response.data.data.token);

      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect wallet",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="w-6/12 h-screen flex flex-col justify-center items-center">
      <CardHeader>
        <CardTitle>Connect your wallet</CardTitle>
        <CardDescription>
          Click 'Connect Wallet' to connect your wallet
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          onClick={handleConnectWallet}
          disabled={loading}
          className="p-5"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </>
          ) : (
            <>
              <Plug /> Connect Wallet
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
