'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { RedirectToSignIn, SignOutButton } from "@clerk/nextjs";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { PlusIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { DashboardSidebar } from "./_components/sidebar";

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
            <RedirectToSignIn/>
        </Unauthenticated>
        </>
    )
}

