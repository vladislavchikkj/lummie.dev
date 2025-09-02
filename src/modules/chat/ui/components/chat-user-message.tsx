import {Card} from "@/components/ui/card";

interface Props {
    content: string
}

export const ChatUserMessage = ({content} : Props) => {
    return (
        <div className="w-full">
            <div className='pt-2 pr-1'>
                <div className='flex justify-end pb-4 pr-2 pl-10'>
                    <Card className='rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words'>
                        {content}
                    </Card>
                </div>
            </div>
        </div>
    );
}