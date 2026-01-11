-- Allow authenticated users (Admins) to DELETE chat logs
create policy "Enable delete access for authenticated users only"
on chat_logs for delete using ( auth.role() = 'authenticated' );
