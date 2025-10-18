import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get user's chats
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // Find user by ID or user_uid
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { user_uid: userId }
          ]
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const chats = await prisma.chat.findMany({
        where: {
          OR: [
            { senderId: user.id },
            { receiverId: user.id }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          },
          receiver: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          },
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          lastMessageAt: 'desc'
        }
      });

      res.status(200).json({
        success: true,
        chats
      });

    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch chats'
      });
    }
  } else if (req.method === 'POST') {
    // Create new chat
    try {
      const { senderId, receiverId, listingType, listingId } = req.body;

      if (!senderId || !receiverId) {
        return res.status(400).json({
          success: false,
          error: 'Sender and receiver IDs are required'
        });
      }

      // Find sender and receiver by ID or user_uid
      const sender = await prisma.user.findFirst({
        where: {
          OR: [
            { id: senderId },
            { user_uid: senderId }
          ]
        }
      });

      const receiver = await prisma.user.findFirst({
        where: {
          OR: [
            { id: receiverId },
            { user_uid: receiverId }
          ]
        }
      });

      if (!sender || !receiver) {
        return res.status(404).json({
          success: false,
          error: 'Sender or receiver not found'
        });
      }

      // Check if chat already exists
      const existingChat = await prisma.chat.findFirst({
        where: {
          OR: [
            {
              senderId: sender.id,
              receiverId: receiver.id,
              listingType: listingType || null,
              listingId: listingId || null
            },
            {
              senderId: receiver.id,
              receiverId: sender.id,
              listingType: listingType || null,
              listingId: listingId || null
            }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          },
          receiver: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          }
        }
      });

      if (existingChat) {
        return res.status(200).json({
          success: true,
          chat: existingChat
        });
      }

      // Create new chat
      const chat = await prisma.chat.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          listingType: listingType || null,
          listingId: listingId || null
        },
        include: {
          sender: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          },
          receiver: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        chat
      });

    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create chat'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
