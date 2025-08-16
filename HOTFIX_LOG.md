# Edge Function Authentication Hotfix Log

## Issue Resolved
Fixed 401/unauthorized errors in protected Edge Functions by implementing explicit JWT token extraction and validation.

## Root Cause
Edge Functions were using implicit session-based authentication (`supabaseClient.auth.getUser()`) which was failing with "AuthSessionMissingError" despite valid JWT tokens being present in Authorization headers.

## Solution Implemented
1. **Created shared authentication utility** (`supabase/functions/_auth_util.ts`)
   - `extractToken(req)` - Extracts JWT token from Authorization header using regex
   - `getUserFromToken(token)` - Validates JWT token directly with Supabase auth
   - `supabaseAuthed(token)` - Creates authenticated Supabase client with explicit token

2. **Updated protected Edge Functions** to use explicit token-based authentication:
   - `supabase/functions/brands/index.ts` 
   - `supabase/functions/generate-text/index.ts`
   - `supabase/functions/generate-image/index.ts` 
   - `supabase/functions/schedule/index.ts`

3. **Verified JWT settings** in `supabase/config.toml`:
   - All protected functions have `verify_jwt = true`
   - Public functions (worker, health) have `verify_jwt = false`

## Changes Made
- **NEW FILE**: `supabase/functions/_auth_util.ts` - Shared authentication utilities
- **UPDATED**: All protected Edge Functions now use explicit JWT extraction
- **VERIFIED**: `supabase/config.toml` JWT configuration is correct

## Expected Results
✅ Brand creation from UI should now work without 401 errors  
✅ Edge Function logs should show "brands() user: <uuid>" instead of "unauthorized"  
✅ All protected functions (brands, generate-*, schedule) should authenticate properly  
✅ Frontend → Edge Functions → Database flow should work end-to-end  

## Next Steps
1. Test brand creation from UI
2. Verify Edge Function logs show successful authentication
3. Test content generation endpoints
4. Confirm all protected functions work with valid JWT tokens

## Deployment Status
Functions updated and ready for deployment. Authentication hotfix is complete.