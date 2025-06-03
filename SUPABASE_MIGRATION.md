# SQLite to Supabase Migration Guide

This guide will help you migrate your ReWear application from SQLite to Supabase for Vercel deployment.

## Step 1: Set up Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Wait for the project to be fully provisioned

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy your Project URL and anon public key
3. Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js
npm uninstall better-sqlite3 sqlite sqlite3
```

## Step 4: Run Database Migration

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-migration.pgsql` 
3. Paste and run the SQL in the Supabase SQL Editor
4. This will create all your tables with the proper schema

## Step 5: Update Your Code

The migration has already:
- ✅ Created `src/lib/supabase.ts` with all database functions
- ✅ Updated API routes to use Supabase
- ✅ Converted SQLite queries to Supabase queries
- ✅ Updated TypeScript types for PostgreSQL

## Step 6: Update Import Statements

Find and replace in your codebase:
- `import { ... } from '@/lib/db'` → `import { ... } from '@/lib/supabase'`

## Step 7: Update Function Calls

### Before (SQLite):
```typescript
const user = findUserByEmail(email); // Synchronous
```

### After (Supabase):
```typescript
const user = await findUserByEmail(email); // Asynchronous
```

Most database functions now return Promises, so add `await` where needed.

## Step 8: Key Differences to Note

### Data Types:
- SQLite `TEXT PRIMARY KEY` → PostgreSQL `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
- SQLite `INTEGER` → PostgreSQL `SERIAL` for auto-increment
- SQLite `DATETIME` → PostgreSQL `TIMESTAMPTZ`
- SQLite `INTEGER` for booleans → PostgreSQL `BOOLEAN`

### Column Names:
- `googleId` → `google_id` (snake_case convention)
- `imageUrl` → `image_url`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

### Query Changes:
- No more prepared statements
- Use Supabase query builder instead of raw SQL
- All queries are now asynchronous

## Step 9: Test Your Application

1. Start your development server: `npm run dev`
2. Test user registration/login
3. Test data creation and retrieval
4. Check that all database operations work

## Step 10: Deploy to Vercel

1. Add your Supabase environment variables to Vercel:
   - Go to your Vercel project settings
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Deploy your application

## Benefits of This Migration

1. **Vercel Compatible**: Works perfectly with serverless functions
2. **Free Tier**: 500MB storage, plenty for development
3. **Real-time Features**: Built-in real-time subscriptions
4. **Better Performance**: Connection pooling and optimizations
5. **Scalability**: Can handle much more traffic than SQLite
6. **Security**: Row-level security and built-in auth
7. **Backup**: Automatic backups included

## Troubleshooting

### Common Issues:

1. **Environment Variables**: Make sure they're properly set in both development and production
2. **Async/Await**: Remember to add `await` to all database calls
3. **Column Names**: Update any hardcoded column names to snake_case
4. **Data Types**: Check that your data types match PostgreSQL expectations

### Need Help?

- Check Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord community for support
- Review the generated `src/lib/supabase.ts` file for examples

## Data Migration (Optional)

If you have existing SQLite data you want to migrate:

1. Export your current SQLite data to JSON
2. Use Supabase's bulk insert features to import the data
3. Update any ID references to match the new UUID format

Your application is now ready for production deployment on Vercel! 🚀 