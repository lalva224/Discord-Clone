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
import { usePathname } from "next/navigation";
import { NewDirectMessage } from "./new-direct-message";



export function DashboardSidebar(){
    //I havent been able to find documentation for this on shadcn
    const user = useQuery(api.functions.user.get)
    const directMessages = useQuery(api.functions.dm.list)
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
                                {/**IsActive just means the text will go bold */}
                                <SidebarMenuButton asChild isActive={pathname=='/'}>
                                    <Link href='/'><UserIcon/>Friends</Link>
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
                                    directMessages?.map((directMessage)=>(
                                        <SidebarMenuItem key = {directMessage._id}>
                                            {/**asChild needs 1 child, not more. */}
                                            {/*IsActive just means text will go bold*/}
                                            <SidebarMenuButton asChild isActive={pathname==`/dms/${directMessage._id}`}>
                                                <Link href={`/dms/${directMessage._id}`} >
                                                <Avatar className = 'size-6'>
                                                    <AvatarImage src = {directMessage.user.image}/>
                                                    <AvatarFallback>{directMessage.user.username[0]}</AvatarFallback>
                                                </Avatar>
                                                <p className = 'font-medium'>{directMessage.user.username}</p>
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