import { useState } from 'react';
import { usePiNetwork } from '../contexts/PiNetworkContext';
import ChatModal from './ChatModal';

export default function ChatButton({ listing, seller, className = '' }) {
  const { user, isAuthenticated } = usePiNetwork();
  const [showChat, setShowChat] = useState(false);

  // Don't show chat button if user is not authenticated or if it's their own listing
  const userId = user?.id || user?.user_uid || user?.uid;
  const sellerId = seller?.id || seller?.user_uid || seller?.uid;
  
  if (!isAuthenticated || (userId && userId === sellerId)) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowChat(true)}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Contact Seller
      </button>

      <ChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        listing={listing}
        seller={seller}
      />
    </>
  );
}
