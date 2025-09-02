import {cn} from "@/lib/utils";
import Logo from "@/components/ui/logo";
import {format} from "date-fns";
import React from "react";

type Props = {
    content: string
}

export const ChatModelMessage = ({content}: Props) => {
    return (
        <div
            className={cn(
                'flex flex-col group px-2 pb-4'
            )}
        >
            <div className='flex items-center gap-2 pl-2 mb-2'>
                <Logo width={20} height={20} className='shrink-0'/>
                <span className='text-sm font-medium'>Lummie</span>
                <span
                    className='text-xs text-muted-foreground transition-opacity group-hover:opacity-100'>
					{format(new Date(), "HH:mm 'on' MMM dd, yyyy")}
				</span>
            </div>
            <div className='pl-8.5 flex flex-col gap-y-4'>
                <span>{content}</span>
                {/*{fragment && type === 'RESULT' && (*/}
                {/*    <FragmentCard*/}
                {/*        fragment={fragment}*/}
                {/*        isActiveFragment={isActiveFragment}*/}
                {/*        onFragmentClick={onFragmentClick}*/}
                {/*    />*/}
                {/*)}*/}
            </div>
        </div>
    );
}