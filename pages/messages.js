import { useState, useEffect } from 'react';
import { usePiNetwork } from '@/contexts/PiNetworkContext';
import ChatModal from '@/components/ChatModal';
import Head from 'next/head';

export default function MessagesPage() {
  const { user, isAuthenticated } = usePiNetwork();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchChats();
    }
  }, [isAuthenticated, user]);

  const fetchChats = async () => {
    try {
      const userId = user?.id || user?.user_uid || user?.uid;
      const response = await fetch(`/api/chats?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (chat) => {
    setSelectedChat(chat);
    setShowChatModal(true);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Messages - GT Store</title>
        </Head>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-soft">
              <h1 className="text-2xl font-bold text-white mb-4">
                Login Required
              </h1>
              <p className="text-gray-300 mb-6">
                Please login with your Pi wallet to view your messages.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-brand-blue text-white px-6 py-2 rounded-md hover:bg-brand-dark"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Messages - GT Store</title>
        <meta name="description" content="View and manage your conversations on GT Store" />
      </Head>

      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Messages</h1>
            <p className="text-gray-300">Your conversations with other users</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 text-center shadow-soft">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-800 border border-gray-600 mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-300 mb-6">
                Start a conversation by contacting a seller about their listing.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-brand-blue text-white px-6 py-2 rounded-md hover:bg-brand-dark"
              >
                Browse Listings
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm shadow-soft">
              <div className="p-6">
                <h2 className="text-lg font-medium text-white mb-4">
                  Your Conversations
                </h2>
                <div className="space-y-4">
                  {chats.map((chat) => {
                    const userId = user?.id || user?.user_uid || user?.uid;
                    const otherUser = chat.senderId === userId ? chat.receiver : chat.sender;
                    const lastMessage = chat.messages[0];
                    
                    return (
                      <div
                        key={chat.id}
                        onClick={() => openChat(chat)}
                        className="flex items-center p-4 border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-brand-blue flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {(otherUser.piUsername || otherUser.user_uid).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {otherUser.piUsername || otherUser.user_uid}
                              </p>
                              {chat.listingType && (
                                <p className="text-xs text-gray-400">
                                  About: {chat.listingType} listing
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {chat.lastMessageAt && (
                                <p className="text-xs text-gray-400">
                                  {new Date(chat.lastMessageAt).toLocaleDateString()}
                                </p>
                              )}
                              {chat.unreadCount > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-blue text-white">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {lastMessage && (
                            <p className="text-sm text-gray-300 mt-1 truncate">
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Modal */}
        {selectedChat && (() => {
          const userId = user?.id || user?.user_uid || user?.uid;
          return (
            <ChatModal
              isOpen={showChatModal}
              onClose={() => {
                setShowChatModal(false);
                setSelectedChat(null);
                fetchChats(); // Refresh chats to update unread counts
              }}
              listing={{
                type: selectedChat.listingType,
                id: selectedChat.listingId
              }}
              seller={selectedChat.senderId === userId ? selectedChat.receiver : selectedChat.sender}
            />
          );
        })()}
      </div>
    </>
  );
}
