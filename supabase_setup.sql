-- 1. Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS academic_level text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS exam_mode boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Prayer Requests Table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  is_anonymous boolean not null default false,
  praying_count int not null default 0,
  created_at timestamptz default now()
);
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can read prayer requests
CREATE POLICY "Anyone can view prayer requests"
  ON prayer_requests FOR SELECT
  USING (true);

-- Authenticated users can insert their own prayer requests
CREATE POLICY "Users can create prayer requests"
  ON prayer_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own prayer requests
CREATE POLICY "Users can delete own prayer requests"
  ON prayer_requests FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can update prayer count (for simplicity, a more robust way is a join table but this is fine for now)
CREATE POLICY "Anyone can update prayer count"
  ON prayer_requests FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 3. Notices Table
CREATE TABLE IF NOT EXISTS notices (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  content text not null,
  created_at timestamptz default now()
);
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Anyone can read notices
CREATE POLICY "Anyone can view notices"
  ON notices FOR SELECT
  USING (true);

-- Only admins can insert/update/delete notices
-- Note: we need a function or we can just check the profiles table
CREATE POLICY "Admins can manage notices"
  ON notices
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
