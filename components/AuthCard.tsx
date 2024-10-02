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
import { useRouter } from "next/navigation";

export function AuthCard() {
  const { toast } = useToast();
  const router = useRouter();

  const handleConnectWallet = async () => {
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
      const token = await api.post("/v1/auth/sign-in-or-sign-up", {
        address,
      });
      localStorage.setItem("authToken", token.data.token);

      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect wallet",
      });
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
        <Button onClick={handleConnectWallet}>Connect Wallet</Button>
      </CardFooter>
    </Card>
  );
}
