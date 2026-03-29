import { prisma } from '@/lib/db';

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;

    const chatExists = await prisma.chat.findUnique({
      where: { id },
    });

    if (!chatExists) {
      return Response.json({ message: 'Chat not found' }, { status: 404 });
    }

    const chatMessages = await prisma.message.findMany({
      where: { chatId: id },
      orderBy: { createdAt: 'asc' },
    });

    return Response.json(
      {
        chat: chatExists,
        messages: chatMessages,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error in getting chat by id: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;

    const chatExists = await prisma.chat.findUnique({
      where: { id },
    });

    if (!chatExists) {
      return Response.json({ message: 'Chat not found' }, { status: 404 });
    }

    // Prisma will cascade delete messages automatically due to onDelete: Cascade in schema
    await prisma.chat.delete({
      where: { id },
    });

    return Response.json(
      { message: 'Chat deleted successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error in deleting chat by id: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
