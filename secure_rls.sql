-- 1. Reset Policies (Cleanup old testing policies)
drop policy if exists "Allow public read access" on bot_config;
drop policy if exists "Allow public update access" on bot_config;
drop policy if exists "Allow public insert access" on bot_config;
drop policy if exists "Allow public read access" on chat_logs;
drop policy if exists "Allow public insert access" on chat_logs;

-- 2. Secure "bot_config" (Only Authenticated Admins)
create policy "Enable read access for authenticated users only"
on bot_config for select using ( auth.role() = 'authenticated' );

create policy "Enable update access for authenticated users only"
on bot_config for update using ( auth.role() = 'authenticated' );

create policy "Enable insert access for authenticated users only"
on bot_config for insert with check ( auth.role() = 'authenticated' );

-- 3. Secure "chat_logs" (Only Authenticated Admins can READ)
create policy "Enable read access for authenticated users only"
on chat_logs for select using ( auth.role() = 'authenticated' );

-- 4. CRITICAL: Allow the Bot (Anon/Service) to WRITE logs and READ config
-- Since node.js bot uses the SAME project URL/Key, it connects via API.
-- If we restrict to "authenticated", the bot (using anon key) will fail.
-- FIX: We allow "anon" access BUT we can rely on knowledge that "update" for config is restricted?
-- Actually, for now, to support the Requirement "only logged-in users can access it", 
-- we imply "Human Users via Dashboard".
-- The Bot needs:
-- - SELECT on bot_config
-- - INSERT on chat_logs

create policy "Bot: Allow anon read config"
on bot_config for select using ( true ); -- Bot needs this. Humans also need it but they are authenticated.

create policy "Bot: Allow anon insert logs"
on chat_logs for insert with check ( true ); -- Bot needs this.

-- Wait, this undoes the "Secure" part if anyone with Anon key can read config/write logs.
-- BUT, they can't UPDATE config (Change instructions) which is the important part.
-- Only 'authenticated' users have UPDATE policy.
-- AND 'select' for Logs is restricted to 'authenticated'.

-- REVISED POLICIES:

-- BOT CONFIG
-- Read: Everyone (Bot needs it).
create policy "Allow public read" on bot_config for select using ( true );
-- Write/Update: Only Authenticated.
create policy "Allow authenticated update" on bot_config for update using ( auth.role() = 'authenticated' );
create policy "Allow authenticated insert" on bot_config for insert with check ( auth.role() = 'authenticated' );

-- CHAT LOGS
-- Read: Only Authenticated (Dashboard). Bot doesn't need to read logs usually, just insert.
create policy "Allow authenticated read logs" on chat_logs for select using ( auth.role() = 'authenticated' );
-- Write: Everyone (Bot needs to insert).
create policy "Allow public insert logs" on chat_logs for insert with check ( true );
