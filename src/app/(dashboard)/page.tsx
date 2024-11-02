'use client'
import { Button } from "@/components/ui/button";
import { AcceptedFriendsList, PendingFriendsList } from "./_components/friends-list";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AddFriend } from "./_components/add-friends";
export default function FriendsPage(){
    const friends = useQuery(api.functions.friend.listPending)
    return(
        <>
        {/**
         * flex-1 is shorthand for using flex-grow: 1, flex-shrink: 1, and flex-basis: 0
         * flex-grow means the item will grow to fill container, while flex-shrink means item will shrink to fit into container
         * flex-basis is the original size of the item before it grows or shrinks.
         * Other shorthands: flex-auto (flex-grow-1,flex-shrink-1, flex-basis-auto  This means it starts with the set size before growing or shrinking)
         * There is also flex-none (flex-grow-0, flex-shrink-0, flex-basis-auto) which means it will not grow or shrink 
         * 
         * flex-col is shorthand for flex-direction: column. This means the items will be stacked on top of each other. 
         * flex is neccessary to have for flex to be used. It's order in the className does not matter.
         * 
         * divide-y applies a border at the bottom of each child element with a line, except last one.
         * 
         * honestly, a w-full would've done the same
         */}

         {/**default div is a full height small width container, which means using justify content will have much spacing.
          * the flex-col only applies to the <header> and inner <div> elements, not any of the elements inside those. This is because 
          * flex only applies to direct children, not grandchildren.
          */}
        
        <div className="flex-1 flex-col flex divide-y">
            <header className='flex items-center justify-between p-4'>
                <h1 className="font-semibold">Friends</h1>
                <AddFriend/>
            </header>
            {/**grid is another design system like flex, except its meant for 2d use -> rows and columns, instead of one choice like with flex 
             * grid is used for layout, while flex is used for alignment.
             * In this case grid simply provides padding and gap between items. At the moment it operates as 1 column but it can acts as 2 with:
             * grid-cols-2
            */}
            <div className="grid p-4 gap-4">
                
                <TooltipProvider delayDuration={0}>
                <PendingFriendsList/>
                <AcceptedFriendsList/>
                </TooltipProvider>
            </div>
        </div>
        </>
    )
}

