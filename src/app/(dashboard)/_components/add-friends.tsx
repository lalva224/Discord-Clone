'use client'
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { api } from "../../../../convex/_generated/api";
import { useMutation } from "convex/react";
import React, { useState } from "react"
import { toast } from "sonner";
export function AddFriend(){
    const createFriendRequest = useMutation(api.functions.friend.createFriendRequest)
    const [open,SetOpen] = useState(false)
    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        try{
            //currentTarget is the form element, and username is the input element
            //the other way is to create a input state variable which changes whenever the input field changes.
            await createFriendRequest({username:e.currentTarget.username.value})
            //toast is a nice screen banner that shows up. It's a good way to show messages to the user
            toast.success('Friend request sent')
        }
        catch(error){
            let errorMessage = 'An unknown error occured'
            if (error instanceof Error){
                errorMessage = error.message
            }
            toast.error('Failed to send friend request',{
                description: errorMessage
            })

        }
        
    }
    return(
        <>
       <Dialog open={open} onOpenChange={SetOpen} >
        <DialogTrigger asChild>
            <Button size={'sm'}>Add Friend</Button>
         </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Friend</DialogTitle>
                <DialogDescription>Add a Friend by their username</DialogDescription>
            </DialogHeader>
            {/**contents seprates the form children so that now they are children to the parent container
             * HtmlFor is meant for Labels to match with their inputs
            */}
            <form className='contents' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-1'>

                <Label htmlFor ='username'>Username</Label>
                <Input id ='username' type='text'/>
            </div>
            <DialogFooter>
                <Button>Send Friend Request</Button>
            </DialogFooter>
            </form>
        </DialogContent>
       </Dialog>
        </>
    )
}