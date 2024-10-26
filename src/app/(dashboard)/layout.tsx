'use client'
import { Sidebar,SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { RedirectToSignIn, SignOutButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Plus, PlusIcon, UserIcon } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function DashboardLayout({children}:{children:React.ReactNode}){
    return (
        <>
        <Authenticated>
            <SidebarProvider>
            <DashboardSidebar/>
            {children}
            </SidebarProvider>
            
        </Authenticated>
        <Unauthenticated>
        {/**difference with this and just SignInButton */}
            <RedirectToSignIn/>
        </Unauthenticated>
        </>
    )
}

function DashboardSidebar(){
    //I havent been able to find documentation for this on shadcn
    const user = useQuery(api.functions.user.get)
    if(!user){
        return null
    }
    return (
        
            <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                {/**button functionality is triggered by the link */}
                                <SidebarMenuButton asChild>
                                    <Link href='/friends'><UserIcon/>Friends</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                        <SidebarGroupAction>
                            <PlusIcon/>
                            {/**screen reader only for blind ppl */}
                            <span className ='sr-only'>New Direct Message</span>
                        </SidebarGroupAction>
                    </SidebarGroup>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarGroup>
                    <SidebarGroupContent>
                    <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            {/** asChild: the trigger is coming from the button  */}
                        {/**items center centers items to be next to each other, either horizotnally or vertically while justify center moves them items to the middle */}
                        <SidebarMenuButton className='flex items-center'>
                    <Avatar className="size-6">
                        <AvatarImage src={user?.image}></AvatarImage>
                        {/**loading times */}
                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{user.username}</p>
                    </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <SignOutButton/>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                    </SidebarMenuItem>
                    </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarFooter>
            </Sidebar>
    )
}