import React from 'react';
import useConversation from "../../src/zustand/useConversation.js";

function Conversation({ conversation, emoji, lastIndex }) {
    const { selectedConversation, setSelectedConversation } = useConversation();

    //checking if the clicked conversation corresponds to the conversation
    const isSelected = selectedConversation?._id === conversation._id;
    return (
        <>
            <div className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer ${isSelected ? "bg-sky-500" : ""}`}
                onClick={() => setSelectedConversation(conversation)}>
                <div className='avatar online'>
                    <div className='w-12 rounded-full'>
                        <img src='https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' alt='user avatar' />
                    </div>
                </div>
                <div className='flex flex-col flex-1'>
                    <div className='flex gap-3 justify-between'>
                        <p className='font-bold text-gray-200'>{conversation.firstName}</p>
                        <span className='text-xl'>{emoji}</span>
                    </div>
                </div>
            </div>
            {
                !lastIndex ? <div className='divider my-0 py-0 h-1'></div> : null
            }

        </>
    )
}

export default Conversation