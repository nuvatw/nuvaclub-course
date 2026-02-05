# Issue Tracking System - Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase project
- A Cloudflare account with R2 enabled

## 1. Install Dependencies

```bash
npm install
```

## 2. Database Setup (Supabase)

### 2.1 Run the Migration

Go to your Supabase project dashboard, navigate to **SQL Editor**, and run the migration file:

```sql
-- Copy the contents from:
supabase/migrations/002_create_issues_tables.sql
```

This will create:
- `issues` table with all required fields
- `issue_images` table for image metadata
- Enum types for status, priority, severity, etc.
- Row Level Security policies
- Indexes for performance
- Helper functions

### 2.2 Verify the Migration

After running the migration, verify the tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('issues', 'issue_images');
```

## 3. Cloudflare R2 Setup

### 3.1 Create an R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2** in the sidebar
3. Click **Create bucket**
4. Name it `nuvaclub-issues` (or your preferred name)
5. Choose a location (auto is fine)
6. Click **Create bucket**

### 3.2 Create API Token

1. In the R2 section, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Give it a name like "NuvaClub Issues App"
4. Select **Object Read & Write** permission
5. For **Specify bucket(s)**, select your bucket
6. Click **Create API Token**
7. **IMPORTANT**: Copy the Access Key ID and Secret Access Key immediately (they won't be shown again)

### 3.3 (Optional) Configure Public Access

If you want images to be publicly accessible without presigned URLs:

1. Go to your bucket settings
2. Under **Public access**, click **Allow Access**
3. Or set up a custom domain under **Settings > Custom Domains**
4. Add the public URL to your `.env.local` as `R2_PUBLIC_BASE_URL`

## 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase (from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Cloudflare R2 (from step 3.2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=nuvaclub-issues

# Optional: Public URL if you configured public access
R2_PUBLIC_BASE_URL=https://pub-xxx.r2.dev
```

## 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Production Build

```bash
npm run build
npm start
```

## 7. Vercel Deployment

### 7.1 Push to GitHub

```bash
git add .
git commit -m "Add issue tracking system"
git push
```

### 7.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Add the environment variables from `.env.local`
3. Deploy

### 7.3 Environment Variables on Vercel

Go to **Project Settings > Environment Variables** and add:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | R2 API secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_BASE_URL` | (Optional) Public bucket URL |

## Troubleshooting

### Images not uploading

1. Check that R2 credentials are correct
2. Verify the bucket exists and API token has write permission
3. Check browser console for CORS errors
4. Ensure the bucket allows the upload content types

### "Permission denied" errors

1. Verify you're logged in
2. Check that the migration ran successfully
3. Verify RLS policies are in place

### CORS Issues with R2

If you get CORS errors when uploading directly to R2:

1. Go to your R2 bucket settings
2. Under **CORS Policy**, add:

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Maintenance

### Cleanup Orphaned Images

Run this periodically to clean up images that were never attached to issues:

```sql
SELECT cleanup_orphaned_images();
```

This deletes images that:
- Have no `issue_id`
- Were created more than 24 hours ago
- Were never marked as uploaded

You can set this up as a scheduled function in Supabase or run it manually.
