import { prisma } from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { id: chatId } = req.query;

  if (req.method === 'GET') {
    // Get messages for a chat
    try {
      const { page = 1, limit = 50 } = req.query;

      const messages = await prisma.message.findMany({
        where: { chatId },
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      });

      const total = await prisma.message.count({ where: { chatId } });

      res.status(200).json({
        success: true,
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch messages'
      });
    }
  } else if (req.method === 'POST') {
    // Send new message
    try {
      const { senderId, receiverId, content, messageType = 'text' } = req.body;

      if (!senderId || !receiverId || !content) {
        return res.status(400).json({
          success: false,
          error: 'Sender, receiver, and content are required'
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

      // Create message
      const message = await prisma.message.create({
        data: {
          chatId,
          senderId: sender.id,
          receiverId: receiver.id,
          content,
          messageType
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

      // Update chat with last message info
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          lastMessage: content,
          lastMessageAt: new Date(),
          unreadCount: {
            increment: 1
          }
        }
      });

      res.status(201).json({
        success: true,
        message
      });

    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
