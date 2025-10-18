import { piNetworkService } from '../../../../lib/pi-network-backend';
import { prisma } from '../../../../lib/prisma';

// Helper function to send logistics details message
async function sendLogisticsMessage(buyerId, sellerId, orderId, shippingDetails) {
  try {
    // Create or get existing chat between buyer and seller
    let chat = await prisma.chat.findFirst({
      where: {
        senderId: buyerId,
        receiverId: sellerId,
        listingType: 'order',
        listingId: orderId
      }
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          senderId: buyerId,
          receiverId: sellerId,
          listingType: 'order',
          listingId: orderId,
          lastMessage: 'Order placed - logistics details sent',
          lastMessageAt: new Date()
        }
      });
    }

    // Create logistics details message
    const logisticsMessage = `🚚 **Order Logistics Details**

**Shipping Address:**
${shippingDetails.fullName}
${shippingDetails.address}
${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.zipCode}
${shippingDetails.country}
Phone: ${shippingDetails.phone}

**Payment Status:**
✅ Payment received and seller has been paid immediately
💰 Platform fee (1%) has been collected
🎉 Order is ready for processing

**Next Steps:**
1. Seller will prepare your order for shipment
2. You'll receive tracking information once shipped
3. Contact seller for any questions about your order

Order ID: ${orderId}`;

    await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: sellerId, // Message from seller to buyer
        receiverId: buyerId,
        content: logisticsMessage,
        messageType: 'logistics',
        isRead: false
      }
    });

    // Update chat with latest message
    await prisma.chat.update({
      where: { id: chat.id },
      data: {
        lastMessage: 'Order placed - logistics details sent',
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 }
      }
    });

    console.log('✅ Logistics message sent successfully');
  } catch (error) {
    console.error('❌ Error sending logistics message:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, txid, donationData, purchaseData } = req.body;

    if (!paymentId || !txid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment ID and transaction ID are required' 
      });
    }

    // Complete the payment using the official pi-backend SDK
    try {
      const completedPayment = await piNetworkService.completePayment(paymentId, txid);
      console.log('✅ Payment completed successfully:', completedPayment);
    } catch (piError) {
      // If payment is already completed, that's okay - we can still save to database
      if (piError.message?.includes('already_completed') || piError.response?.data?.error === 'already_completed') {
        console.log('⚠️ Payment already completed on Pi servers, continuing with database save...');
      } else {
        throw piError; // Re-throw other errors
      }
    }

    // Handle donation payments
    if (donationData) {
      try {
        console.log('Saving donation to database:', {
          userId: donationData.userId,
          amount: donationData.amount,
          piPaymentId: paymentId,
          txid: txid,
          status: 'completed',
          memo: donationData.memo,
          metadata: donationData.metadata
        });
        
        // First, ensure the user exists in the database
        let user = await prisma.user.findUnique({
          where: { user_uid: donationData.userId }
        });
        
        if (!user) {
          console.log('⚠️ User not found in database, creating user record...');
          // Create a basic user record if it doesn't exist
          user = await prisma.user.create({
            data: {
              user_uid: donationData.userId,
              piUsername: donationData.metadata?.username || `user_${donationData.userId.slice(0, 8)}`,
              role: 'reader',
              piAuthenticatedAt: new Date()
            }
          });
          console.log('✅ User record created');
        }
        
        // Now create the donation record using the user's database ID
        await prisma.donation.create({
          data: {
            userId: user.id, // Use the database ID, not the user_uid
            amount: donationData.amount,
            piPaymentId: paymentId,
            txid: txid,
            status: 'completed',
            memo: donationData.memo,
            metadata: donationData.metadata
          }
        });
        console.log('✅ Donation saved to database successfully');
      } catch (dbError) {
        console.error('❌ Error saving donation to database:', dbError);
        // Don't fail the payment completion if DB save fails
      }
    }
    
        // Handle product purchase payments
        if (purchaseData) {
          try {
            console.log('Processing purchase order:', {
              buyerId: purchaseData.userId,
              sellerId: purchaseData.sellerId,
              listingType: purchaseData.listingType,
              listingId: purchaseData.listingId,
              amount: purchaseData.totalAmount,
              piPaymentId: paymentId,
              txid: txid,
              shippingDetails: purchaseData.shippingDetails
            });
            
            // Ensure buyer exists in database
            let buyer = await prisma.user.findUnique({
              where: { user_uid: purchaseData.userId }
            });
            
            if (!buyer) {
              console.log('⚠️ Buyer not found in database, creating user record...');
              buyer = await prisma.user.create({
                data: {
                  user_uid: purchaseData.userId,
                  piUsername: purchaseData.metadata?.username || `user_${purchaseData.userId.slice(0, 8)}`,
                  role: 'reader',
                  piAuthenticatedAt: new Date()
                }
              });
              console.log('✅ Buyer record created');
            }

            // Ensure seller exists in database
            let seller = await prisma.user.findUnique({
              where: { user_uid: purchaseData.sellerId }
            });
            
            if (!seller) {
              console.log('⚠️ Seller not found in database, creating user record...');
              seller = await prisma.user.create({
                data: {
                  user_uid: purchaseData.sellerId,
                  piUsername: `seller_${purchaseData.sellerId.slice(0, 8)}`,
                  role: 'seller',
                  piAuthenticatedAt: new Date()
                }
              });
              console.log('✅ Seller record created');
            }
            
            // Create the order record
            const order = await prisma.order.create({
              data: {
                buyerId: buyer.id,
                sellerId: seller.id,
                listingType: purchaseData.listingType,
                listingId: purchaseData.listingId,
                amount: purchaseData.totalAmount,
                productPrice: purchaseData.productPrice,
                logisticsFee: purchaseData.logisticsFee,
                platformFee: purchaseData.platformFee,
                piPaymentId: paymentId,
                txid: txid,
                status: 'paid',
                shippingAddress: purchaseData.shippingDetails
              }
            });

            // Immediately initiate A2U payment to seller
            try {
              console.log('🚀 Initiating A2U payment to seller...');
              const sellerAmount = purchaseData.productPrice + purchaseData.logisticsFee;
              
              const a2uPaymentData = {
                amount: sellerAmount,
                memo: `Payment for ${purchaseData.listingType} order #${order.id}`,
                metadata: {
                  orderId: order.id,
                  buyerId: purchaseData.userId,
                  sellerId: purchaseData.sellerId,
                  listingType: purchaseData.listingType,
                  listingId: purchaseData.listingId,
                  type: 'seller_payment'
                },
                uid: purchaseData.sellerId
              };

              // Create A2U payment
              const a2uPaymentId = await piNetworkService.createPayment(a2uPaymentData);
              console.log(`✅ A2U payment created: ${a2uPaymentId}`);

              // Submit A2U payment to blockchain
              const a2uTxid = await piNetworkService.submitPayment(a2uPaymentId);
              console.log(`✅ A2U payment submitted: ${a2uTxid}`);

              // Complete A2U payment
              const a2uCompletedPayment = await piNetworkService.completePayment(a2uPaymentId, a2uTxid);
              console.log(`✅ A2U payment completed:`, a2uCompletedPayment);

              // Update order with A2U payment details
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  status: 'completed',
                  sellerPaymentId: a2uPaymentId,
                  sellerTxid: a2uTxid,
                  completedAt: new Date()
                }
              });

              console.log('🎉 Order completed successfully with immediate A2U payment to seller');
            } catch (a2uError) {
              console.error('❌ Error processing A2U payment to seller:', a2uError);
              
              // Update order status to indicate A2U payment failed
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  status: 'a2u_failed',
                  notes: `A2U payment failed: ${a2uError.message}`
                }
              });
            }

            // Send logistics details message to buyer
            await sendLogisticsMessage(buyer.id, seller.id, order.id, purchaseData.shippingDetails);
            
            console.log('✅ Purchase order processed successfully');
          } catch (dbError) {
            console.error('❌ Error processing purchase order:', dbError);
            // Don't fail the payment completion if DB save fails
          }
        }

    if (!donationData && !purchaseData) {
      console.log('No payment data provided, skipping database save');
    }

    res.status(200).json({
      success: true,
      message: 'Payment completed successfully'
    });
  } catch (error) {
    console.error('Payment completion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment completion failed',
      error: error.message 
    });
  }
}
