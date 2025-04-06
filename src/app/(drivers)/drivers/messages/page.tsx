"use client";

import { Search, ArrowRight } from "lucide-react";
import { useState } from "react";

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  avatar: string;
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      name: "John D.",
      lastMessage: "I'll be waiting outside the main entrance.",
      time: "10:45 AM",
      unread: true,
      avatar: "J",
    },
    {
      id: "2",
      name: "Sarah M.",
      lastMessage: "Thanks for the ride! 5 stars for you!",
      time: "Yesterday",
      unread: false,
      avatar: "S",
    },
    {
      id: "3",
      name: "Michael R.",
      lastMessage: "I'll be 5 minutes late, sorry about that.",
      time: "Yesterday",
      unread: false,
      avatar: "M",
    },
    {
      id: "4",
      name: "Emily L.",
      lastMessage: "Can you help with my luggage when you arrive?",
      time: "Aug 28",
      unread: false,
      avatar: "E",
    },
  ]);

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-6'>Messages</h1>

      <div className='relative mb-6'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Search size={18} className='text-gray-400' />
        </div>
        <input
          type='text'
          placeholder='Search messages'
          className='w-full py-2 pl-10 pr-4 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-green-800 focus:outline-none'
        />
      </div>

      <div className='space-y-2'>
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`flex items-center p-3 rounded-lg ${
              conversation.unread ? "bg-green-50" : "hover:bg-gray-50"
            } cursor-pointer`}
          >
            <div className='w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3'>
              <span className='font-bold'>{conversation.avatar}</span>
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex justify-between items-center'>
                <h3 className='font-medium truncate'>{conversation.name}</h3>
                <span className='text-xs text-gray-500'>
                  {conversation.time}
                </span>
              </div>
              <p className='text-sm text-gray-500 truncate'>
                {conversation.lastMessage}
              </p>
            </div>
            <ArrowRight size={16} className='text-gray-400 ml-2' />
          </div>
        ))}
      </div>

      {conversations.length === 0 && (
        <div className='text-center py-16'>
          <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              stroke-width='2'
              stroke-linecap='round'
              stroke-linejoin='round'
              className='text-gray-400'
            >
              <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
            </svg>
          </div>
          <h3 className='text-lg font-medium text-gray-900'>No messages yet</h3>
          <p className='text-gray-500 mt-1'>
            Messages from passengers will appear here
          </p>
        </div>
      )}
    </div>
  );
}
