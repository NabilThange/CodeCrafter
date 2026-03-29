import { z } from 'zod';
import ModelRegistry from '@/lib/vane/models/registry';
import { ModelWithProvider } from '@/lib/vane/models/types';
import SearchAgent from '@/lib/vane/agents/search';
import SessionManager from '@/lib/vane/session';
import { ChatTurnMessage } from '@/lib/vane/types';
import { SearchSources } from '@/lib/vane/agents/search/types';
import { prisma } from '@/lib/db';
import UploadManager from '@/lib/vane/uploads/manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const messageSchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
  chatId: z.string().min(1, 'Chat ID is required'),
  content: z.string().min(1, 'Message content is required'),
});

const chatModelSchema: z.ZodType<ModelWithProvider> = z.object({
  providerId: z.string({ message: 'Chat model provider id must be provided' }),
  key: z.string({ message: 'Chat model key must be provided' }),
});

const embeddingModelSchema: z.ZodType<ModelWithProvider> = z.object({
  providerId: z.string({
    message: 'Embedding model provider id must be provided',
  }),
  key: z.string({ message: 'Embedding model key must be provided' }),
});

const bodySchema = z.object({
  message: messageSchema,
  optimizationMode: z.enum(['speed', 'balanced', 'quality'], {
    message: 'Optimization mode must be one of: speed, balanced, quality',
  }),
  sources: z.array(z.string()).optional().default([]),
  history: z
    .array(z.tuple([z.string(), z.string()]))
    .optional()
    .default([]),
  files: z.array(z.string()).optional().default([]),
  chatModel: chatModelSchema,
  embeddingModel: embeddingModelSchema,
  systemInstructions: z.string().nullable().optional().default(''),
});

type Body = z.infer<typeof bodySchema>;

const safeValidateBody = (data: unknown) => {
  const result = bodySchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };
  }

  return {
    success: true,
    data: result.data,
  };
};

const ensureChatExists = async (input: {
  id: string;
  sources: SearchSources[];
  query: string;
  fileIds: string[];
  userId: string;
}) => {
  try {
    const exists = await prisma.chat.findUnique({
      where: { id: input.id },
    });

    if (!exists) {
      await prisma.chat.create({
        data: {
          id: input.id,
          userId: input.userId,
          title: input.query,
          // Store sources and files in metadata JSON field
          // metadata: {
          //   sources: input.sources,
          //   files: input.fileIds.map((id) => ({
          //     fileId: id,
          //     name: UploadManager.getFile(id)?.name || 'Uploaded File',
          //   })),
          // },
        },
      });
    }
  } catch (err) {
    console.error('Failed to check/save chat:', err);
  }
};

export const POST = async (req: Request) => {
  try {
    const reqBody = (await req.json()) as Body;

    const parseBody = safeValidateBody(reqBody);

    if (!parseBody.success) {
      return Response.json(
        { message: 'Invalid request body', error: parseBody.error },
        { status: 400 },
      );
    }

    const body = parseBody.data as Body;
    const { message } = body;

    if (message.content === '') {
      return Response.json(
        {
          message: 'Please provide a message to process',
        },
        { status: 400 },
      );
    }

    const registry = new ModelRegistry();

    const [llm, embedding] = await Promise.all([
      registry.loadChatModel(body.chatModel.providerId, body.chatModel.key),
      registry.loadEmbeddingModel(
        body.embeddingModel.providerId,
        body.embeddingModel.key,
      ),
    ]);

    const history: ChatTurnMessage[] = body.history.map((msg) => {
      if (msg[0] === 'human') {
        return {
          role: 'user',
          content: msg[1],
        };
      } else {
        return {
          role: 'assistant',
          content: msg[1],
        };
      }
    });

    const agent = new SearchAgent();
    const session = SessionManager.createSession();

    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    const disconnect = session.subscribe((event: string, data: any) => {
      if (event === 'data') {
        if (data.type === 'block') {
          writer.write(
            encoder.encode(
              JSON.stringify({
                type: 'block',
                block: data.block,
              }) + '\n',
            ),
          );
        } else if (data.type === 'updateBlock') {
          writer.write(
            encoder.encode(
              JSON.stringify({
                type: 'updateBlock',
                blockId: data.blockId,
                patch: data.patch,
              }) + '\n',
            ),
          );
        } else if (data.type === 'researchComplete') {
          writer.write(
            encoder.encode(
              JSON.stringify({
                type: 'researchComplete',
              }) + '\n',
            ),
          );
        }
      } else if (event === 'end') {
        writer.write(
          encoder.encode(
            JSON.stringify({
              type: 'messageEnd',
            }) + '\n',
          ),
        );
        writer.close();
        session.removeAllListeners();
      } else if (event === 'error') {
        writer.write(
          encoder.encode(
            JSON.stringify({
              type: 'error',
              data: data.data,
            }) + '\n',
          ),
        );
        writer.close();
        session.removeAllListeners();
      }
    });

    agent.searchAsync(session, {
      chatHistory: history,
      followUp: message.content,
      chatId: body.message.chatId,
      messageId: body.message.messageId,
      config: {
        llm,
        embedding: embedding,
        sources: body.sources as SearchSources[],
        mode: body.optimizationMode,
        fileIds: body.files,
        systemInstructions: body.systemInstructions || 'None',
      },
    });

    ensureChatExists({
      id: body.message.chatId,
      sources: body.sources as SearchSources[],
      fileIds: body.files,
      query: body.message.content,
      userId: 'default-user', // TODO: Get from auth session
    });

    req.signal.addEventListener('abort', () => {
      disconnect();
      writer.close();
    });

    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (err) {
    console.error('An error occurred while processing chat request:', err);
    return Response.json(
      { message: 'An error occurred while processing chat request' },
      { status: 500 },
    );
  }
};
