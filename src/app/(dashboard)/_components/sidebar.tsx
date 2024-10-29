'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { SignOutButton } from "@clerk/nextjs";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { useQuery } from "convex/react";
import { PlusIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { api } from '../../../../convex/_generated/api';
import { NewDirectMessage } from "./new-direct-message";
import { usePathname } from "next/navigation";


const useTestDirectMessages = () =>{
    const user = useQuery(api.functions.user.get)
    if(!user){
        return []
    }
    return [user,user,user]
}

export function DashboardSidebar(){
    //I havent been able to find documentation for this on shadcn
    const user = useQuery(api.functions.user.get)
    const directMessages = useTestDirectMessages()
    const pathname = usePathname()
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
                                
                                <SidebarMenuButton asChild isActive={pathname=='/'}>
                                    <Link href='/friends'><UserIcon/>Friends</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                        <NewDirectMessage/>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {
                                    directMessages.map((directMessage)=>(
                                        <SidebarMenuItem key = {directMessage._id}>
                                            {/**asChild needs 1 child, not more. */}
                                            {/**DM page only visible when in another DM page? */}
                                            <SidebarMenuButton asChild isActive={pathname==`/dms/${directMessage._id}`}>
                                                <Link href={`/dms/${directMessage._id}`} >
                                                <Avatar className = 'size-6'>
                                                    <AvatarImage src = {directMessage.image}/>
                                                    <AvatarFallback>{directMessage.username[0]}</AvatarFallback>
                                                </Avatar>
                                                <p className = 'font-medium'>{directMessage.username}</p>
                                                </Link>
                                            </SidebarMenuButton>
                                            </SidebarMenuItem>

                                    ))
                                }
                            </SidebarMenu>
                        </SidebarGroupContent>
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