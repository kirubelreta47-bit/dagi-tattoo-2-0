<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/dfb0aca8-a40a-42ba-8a6b-3837c76db894

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env` file with your Supabase configuration. Use `.env.example` as a template.
3. Run the app:
   `npm run dev`

## Supabase configuration

You need a Supabase project with:
- a `schedules` table that includes fields matching the booking form
- an admin user account for the dashboard

Add these environment variables to `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ADMIN_EMAIL`

Then run `npm run dev` to start the frontend and backend together.
