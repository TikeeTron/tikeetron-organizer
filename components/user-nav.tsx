import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Organizer } from "@/app/page";
import { useEffect, useState } from "react";
import ProfileForm from "./profile-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import api from "@/lib/utils";
import { TronWeb } from "tronweb";

export default function UserNav() {
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const getOrganizer = async () => {
    const address = ((window as any).tronWeb as TronWeb)?.defaultAddress.base58;
    const response = await api.get(`/v1/organizers/${address}`);

    setOrganizer(response.data.data);
  };
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getOrganizer();
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={organizer?.photoUrl} alt="photo" />
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {organizer?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {organizer?.address?.slice(0, 26)}...
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <div className="w-full">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger className="text-left text-sm hover:bg-gray-100 p-2 w-full">
                  Profile
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                    <DialogDescription>
                      Your profile information
                    </DialogDescription>
                  </DialogHeader>
                  <ProfileForm
                    name={organizer?.name ?? ""}
                    onSuccess={async () => {
                      setIsOpen(false);
                      await getOrganizer();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              localStorage.removeItem("authToken");
              localStorage.removeItem("organizerId");
              window.location.reload();
            }}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
