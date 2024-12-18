import { Toaster } from "sonner";
import { getVacations, getVacationsByQuery } from "./api/VacationsController";
import Navbar from "./components/Navbar";
import PageNavigator from "./components/PageNavigator";
import VacationCard from "./components/VacationCard";
import { Discount, DiscountType, LoyaltyType, VacationsResponse } from "./types/types";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDiscounts, getLimitedDiscounts, getLoyalty } from "@/app/api/DiscountsController";

export const POSITIVE_NUMBER = /^\d*$/;

function isDiscountValid(discount: Discount) {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= discount.starts_at && currentTime <= discount.expires_at;
}

function isLimitedDiscountValid(expiresAt: number) {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime <= expiresAt;
}

export default async function Home({ searchParams }: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) return redirect("/logout");

    const { page = '0', query = '' } = await searchParams;
    const vacationsLimit = 10;

    var pageNumber = 0;
    if (page.match(POSITIVE_NUMBER)) {
        pageNumber = Number(page);
    }

    const response: VacationsResponse = query.length > 0 ? await getVacationsByQuery(decodeURIComponent(query), pageNumber, vacationsLimit) : await getVacations(pageNumber, vacationsLimit);
    if (pageNumber >= response.pages) pageNumber = response.pages - 1;

    const discounts: Discount[] = await getDiscounts();
    const limitedDiscounts = await getLimitedDiscounts();
    const loyalty = await getLoyalty();
    const discountTypes: Record<string, DiscountType> = {};
    const discountAmount: Record<string, number> = {};

    response.items.forEach(vacation => {
        discountAmount[vacation.id] = 0;
        if (loyalty === LoyaltyType.NORMAL) discountAmount[vacation.id] = 0.05;

        const discount = discounts.find(discount => discount.product_id === vacation.id && isDiscountValid(discount));
        if (discount) {
            discountTypes[vacation.id] = DiscountType.NORMAL;
            discountAmount[vacation.id] += discount.amount;
            return;
        }

        if (limitedDiscounts[vacation.id] !== undefined && isLimitedDiscountValid(limitedDiscounts[vacation.id])) {
            discountTypes[vacation.id] = DiscountType.LIMITED;
            discountAmount[vacation.id] += 0.1;
            return;
        }

        discountTypes[vacation.id] = DiscountType.NONE;
    })

    return (
        <div className="flex flex-col gap-4 p-4 items-center">
            <Navbar discountAmount={discountAmount} />
            <div className="grid gap-6 w-full grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                {response.items.length > 0 && (() => {
                    const items: any = [];
                    for (const vacation of response.items) {
                        items.push(<VacationCard key={vacation.id} vacation={{
                            ...vacation
                        }} discount={discountTypes[vacation.id]} discountAmount={discountAmount[vacation.id]} />)
                    }
                    return items;
                })()}
            </div>
            <PageNavigator currentPage={pageNumber} maxPages={response.pages} />
            <Toaster />
        </div>
    );
}