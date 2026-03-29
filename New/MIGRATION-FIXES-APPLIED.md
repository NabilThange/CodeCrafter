# Migration Fixes Applied

## ✅ Completed Tasks

### Task 1: Fixed Import Paths
- ✅ Updated `@/lib/allocation/engine` → `@/lib/kuberaa/allocation` in:
  - `New/app/api/kuberaa/allocation/route.ts`
  - `New/app/api/kuberaa/etfs/suggest/route.ts`

- ✅ Updated `@/lib/searxng` → `@/lib/vane/search` in:
  - `New/lib/vane/agents/media/video.ts`
  - `New/lib/vane/agents/media/image.ts`
  - `New/lib/vane/agents/search/researcher/actions/webSearch.ts`
  - `New/lib/vane/agents/search/researcher/actions/socialSearch.ts`
  - `New/lib/vane/agents/search/researcher/actions/academicSearch.ts`
  - `New/app/api/vane/api/discover/route.ts`

### Task 2 & 3: Converted Drizzle to Prisma
- ✅ Converted `New/app/api/vane/api/chats/route.ts`:
  - Changed `db.query.chats.findMany()` → `prisma.chat.findMany()`
  - Added proper ordering with `orderBy`
  - Updated import from `db` to `prisma`

- ✅ Converted `New/app/api/vane/api/chats/[id]/route.ts`:
  - Changed `db.query.chats.findFirst()` → `prisma.chat.findUnique()`
  - Changed `db.query.messages.findMany()` → `prisma.message.findMany()`
  - Changed `db.delete()` → `prisma.chat.delete()` (cascade handles messages)
  - Removed Drizzle imports (`eq`, `chats`, `messages` from schema)

- ✅ Converted `New/app/api/vane/api/chat/route.ts`:
  - Updated `ensureChatExists` function to use Prisma
  - Changed `db.query.chats.findFirst()` → `prisma.chat.findUnique()`
  - Changed `db.insert(chats)` → `prisma.chat.create()`
  - Added userId field (using 'default-user' placeholder for now)
  - Removed Drizzle imports

- ✅ Converted `New/lib/vane/agents/search/index.ts`:
  - Changed `db.query.messages.findFirst()` → `prisma.message.findFirst()`
  - Changed `db.insert(messages)` → `prisma.message.create()`
  - Changed `db.update(messages)` → `prisma.message.update()`
  - Changed `db.delete(messages)` → `prisma.message.deleteMany()`
  - Adapted to use Prisma's metadata JSON field for Vane-specific data
  - Removed Drizzle imports

### Task 4: Fixed Component Imports
- ✅ Updated Vane API route imports to use correct paths:
  - `@/lib/models` → `@/lib/vane/models`
  - `@/lib/agents` → `@/lib/vane/agents`
  - `@/lib/session` → `@/lib/vane/session`
  - `@/lib/types` → `@/lib/vane/types`
  - `@/lib/prompts` → `@/lib/vane/prompts`

### Task 5: Added Missing Files
- ✅ Created `New/lib/vane/session.ts` (copied from Vane source)

## ⚠️ Remaining Work

### Missing Support Files (Need to be copied from Vane)
The following files/folders need to be copied from `Vane/src/lib/` to `New/lib/vane/`:

1. **Config System** (`Vane/src/lib/config/` → `New/lib/vane/config/`):
   - `clientRegistry.ts`
   - `serverRegistry.ts`
   - `types.ts`
   - `index.ts`

2. **Uploads System** (`Vane/src/lib/uploads/` → `New/lib/vane/uploads/`):
   - `manager.ts`
   - `store.ts`

3. **Hooks** (`Vane/src/lib/hooks/` → `New/lib/vane/hooks/`):
   - `useChat.tsx`

4. **Utils** (`Vane/src/lib/utils/` → `New/lib/vane/utils/`):
   - `formatHistory.ts`
   - `computeSimilarity.ts`
   - `files.ts`
   - `hash.ts`
   - `splitText.ts`

5. **Actions** (already exists but may need review):
   - `New/lib/vane/actions.ts` (verify it has all needed exports)

### Import Path Updates Needed
After copying the above files, update imports in all Vane files:
- `@/lib/config` → `@/lib/vane/config`
- `@/lib/uploads` → `@/lib/vane/uploads`
- `@/lib/hooks` → `@/lib/vane/hooks`
- `@/lib/utils` → `@/lib/vane/utils`
- `@/lib/models` → `@/lib/vane/models`
- `@/lib/agents` → `@/lib/vane/agents`
- `@/lib/prompts` → `@/lib/vane/prompts`
- `@/lib/types` → `@/lib/vane/types`
- `@/lib/session` → `@/lib/vane/session`
- `@/lib/actions` → `@/lib/vane/actions`

### Database Schema Considerations
The Prisma schema has a simplified Message model compared to the original Vane Drizzle schema:
- **Prisma**: `id`, `chatId`, `role`, `content`, `metadata`, `createdAt`
- **Original Vane**: Had additional fields like `messageId`, `backendId`, `query`, `status`, `responseBlocks`

**Solution Applied**: Store Vane-specific fields in the `metadata` JSON field:
```typescript
metadata: {
  messageId: string,
  backendId: string,
  query: string,
  status: 'answering' | 'completed',
  responseBlocks: Block[]
}
```

### Authentication Integration
The chat creation currently uses a placeholder userId:
```typescript
userId: 'default-user' // TODO: Get from auth session
```

This needs to be updated to use actual authentication when implemented.

## 📋 Next Steps

1. Copy missing support files from Vane to New/lib/vane/
2. Update all remaining import paths in Vane files
3. Test the build: `cd New && npm run build`
4. Fix any remaining TypeScript errors
5. Test Vane chat functionality
6. Test Kuberaa portfolio functionality
7. Integrate proper authentication for userId

## 🔍 Verification Commands

```bash
# Check for any remaining old import paths
cd New
grep -r "@/lib/allocation/engine" --include="*.ts" --include="*.tsx"
grep -r "@/lib/searxng" --include="*.ts" --include="*.tsx"
grep -r "from 'drizzle-orm'" --include="*.ts" --include="*.tsx"
grep -r "db.query\." --include="*.ts" --include="*.tsx"
grep -r "db.insert\(" --include="*.ts" --include="*.tsx"

# Check for imports that need vane/ prefix
grep -r "from '@/lib/models'" --include="*.ts" --include="*.tsx" lib/vane/
grep -r "from '@/lib/config'" --include="*.ts" --include="*.tsx" lib/vane/
grep -r "from '@/lib/uploads'" --include="*.ts" --include="*.tsx" lib/vane/
```

## ✨ Summary

**Completed**: 
- All import path fixes for allocation and searxng
- Complete Drizzle to Prisma conversion for all Vane database operations
- Database import statement updates
- Core Vane API routes are now using Prisma

**Remaining**: 
- Copy missing support files (config, uploads, hooks, utils)
- Update remaining import paths to use vane/ prefix
- Build and test the application
