-- SQL Setup for Travel Experiences Platform

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    follower_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Turn on Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone can see public profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create a profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    -- Default Ready Player Me 3D Avatar (Option B)
    'https://models.readyplayer.me/659e99a8dfc47102adcf03fe.glb'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Posts (Travel Experiences) Table
CREATE TYPE post_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) NOT NULL,
    country TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    status post_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone can see APPROVED posts
CREATE POLICY "Approved posts viewable by everyone." ON posts FOR SELECT USING (status = 'approved');
-- Select policy: Authors can see their own PENDING/REJECTED posts
CREATE POLICY "Authors can see their own pending posts." ON posts FOR SELECT USING (auth.uid() = author_id);
-- Insert policy: Authenticated users can insert posts, but status is 'pending' by default.
CREATE POLICY "Authenticated users can create posts." ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);


-- 3. Follows Table (Instagram style)
CREATE TABLE follows (
    follower_id UUID REFERENCES profiles(id) NOT NULL,
    following_id UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Select policy: Follows are public
CREATE POLICY "Follows are viewable by everyone." ON follows FOR SELECT USING (true);
-- Insert/Delete policy: You can only 'follow' or 'unfollow' as yourself
CREATE POLICY "Users can follow others." ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others." ON follows FOR DELETE USING (auth.uid() = follower_id);


-- 4. Triggers to update Follower/Following counts
CREATE OR REPLACE FUNCTION increment_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_follow_created
    AFTER INSERT ON follows
    FOR EACH ROW EXECUTE PROCEDURE increment_follow_counts();

CREATE OR REPLACE FUNCTION decrement_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE profiles SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_follow_deleted
    AFTER DELETE ON follows
    FOR EACH ROW EXECUTE PROCEDURE decrement_follow_counts();
