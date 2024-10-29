import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarGroupAction } from "@/components/ui/sidebar";

import { PlusIcon } from "lucide-react";

export function NewDirectMessage(){
    return (
        <Dialog>
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
            <form className='contents'>
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