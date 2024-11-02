import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useMutation,useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";

export function NewDirectMessage(){
    const createDirectMessage = useMutation(api.functions.dm.create)
    const [open,SetOpen] = useState(false)
    const router = useRouter()

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        try{
            //currentTarget is the form element, and username is the input element
            //the other way is to create a input state variable which changes whenever the input field changes.
           const id = await createDirectMessage({username:e.currentTarget.username.value})
           router.push(`/dms/${id}`)
            //toast is a nice screen banner that shows up. It's a good way to show messages to the user
            
        }
        catch(error){
            toast.error('Failed to start direct message')
            let errorMessage = 'An unknown error occured'
            if (error instanceof Error){
                errorMessage = error.message
            }
            toast.error('Failed to send friend request',{
                description: errorMessage
            })

        }
    }
    return (
        <Dialog open={open} onOpenChange={SetOpen}>
            <DialogTrigger asChild>
                <SidebarGroupAction>
                    <PlusIcon/>
                    {/**screen reader only for blind ppl */}
                     <span className ='sr-only'>New Direct Message</span>
                </SidebarGroupAction>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>New Direct Message</DialogTitle>
                <DialogDescription>Enter a username to start a new direct message</DialogDescription>
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
                <Button>Start Direct Message</Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    )
}