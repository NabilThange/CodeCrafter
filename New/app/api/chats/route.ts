import { prisma } from '@/lib/db';

export const GET = async (req: Request) => {
  try {
    const chats = await prisma.chat.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return Response.json({ chats: chats }, { status: 200 });
  } catch (err) {
    console.error('Error in getting chats: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
