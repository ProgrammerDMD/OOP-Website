"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Vacation } from "../types/types";
import { Dog, Dumbbell, Equal, Euro, SquareParking, User, Utensils, Wifi } from "lucide-react";
import { useCheckout } from "@/app/api/CheckoutController";
import { toast } from "sonner";

const FEATURES_ICONS = [
    <Utensils key="breakfast" />,
    <SquareParking key="parking" />,
    <Wifi key="wifi" />,
    <Dog key="pets" />,
    <Dumbbell key="gym" />
]

export function MoreDetails({ vacation }: {
    vacation: Vacation
}) {
    const checkout = useCheckout();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>More details</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{vacation.name}</DialogTitle>
                    <DialogDescription>{vacation.location} ({vacation.quantity} seats)</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-1">
                    <p>{vacation.description}</p>
                    <h1 className="font-bold">Commodities</h1>
                    <div className="flex gap-2">
                        {(() => {
                            const items: any = [];
                            for (const feature of vacation.features) {
                                if (FEATURES_ICONS.at(feature) !== undefined) items.push(FEATURES_ICONS.at(feature));
                            }
                            return items;
                        })()}
                    </div>
                    <h1 className="font-bold">Price</h1>
                    <div className="flex gap-2">
                        <div className="flex">
                            <span>1x</span><User />
                        </div>
                        <Equal />
                        <div className="flex">
                            <Euro />
                            <span>{vacation.price.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={() => {
                        checkout.addProduct(vacation.id, 1);
                        toast("Added to cart", {
                            description: `x1 '${vacation.name}' for €${vacation.price.toFixed(2)}`,
                            action: {
                                label: "Undo",
                                onClick: () => checkout.removeProduct(vacation.id, 1)
                            }
                        });
                    }}>Add to cart</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
