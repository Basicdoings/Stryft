-- Extension setup for optimized querying  
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Core Biometrics)  
create table public.profiles (  
  id uuid references auth.users on delete cascade primary key,  
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,  
  gender text check (gender in ('male', 'female', 'other')) not null,  
  age integer check (age between 18 and 99) not null,  
  current_weight_kg decimal(5,2) not null,  
  fitness_level text check (fitness_level in ('beginner', 'intermediate', 'advanced')) not null,  
  sleep_quality text check (sleep_quality in ('poor', 'fair', 'good', 'excellent')) not null,  
  location text default 'Lagos, Nigeria' not null  
);

-- 2. Fitness Goals & Scan Storage Map  
create table public.fitness_goals (  
  id uuid default gen_random_uuid() primary key,  
  user_id uuid references public.profiles(id) on delete cascade not null,  
  primary_goal_zone text check (primary_goal_zone in ('abs', 'glutes', 'v-taper', 'hourglass', 'arms', 'thighs')) not null,  
  secondary_goal_zone text,  
  timeline_weeks integer check (timeline_weeks in (8, 12, 16)) not null,  
    
  -- Supabase Storage Bucket File Path Reference Strings  
  front_scan_photo_url text,  
  right_scan_photo_url text,  
  left_scan_photo_url text,  
    
  -- Cloud Generated Assets  
  generated_mesh_url text,
  generated_ai_texture_url text,  
  tripo_task_id text,
  tripo_provider text,
  initial_body_fat_pct decimal(4,2),  
  efficiency_coefficient decimal(3,2) default 1.00 not null,  
    
  created_at timestamp with time zone default timezone('utc'::text, now()) not null  
);

-- 3. Gamified RPG State Table  
create table public.user_game_state (  
  user_id uuid references public.profiles(id) on delete cascade primary key,  
  current_xp integer default 0 not null,  
  level integer default 1 not null,  
  attributes jsonb default '{"STR": 10, "END": 10, "WIS": 10, "CON": 10}'::jsonb not null,  
  equipped_items jsonb default '[]'::jsonb not null,  
  last_check_in timestamp with time zone  
);

-- 4. Dynamic Workout Plans Matrix  
create table public.workout_plans (  
  id uuid default gen_random_uuid() primary key,  
  user_id uuid references public.profiles(id) on delete cascade not null,  
  day_of_week text check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')) not null,  
  exercises jsonb default '[]'::jsonb not null, -- Array of clinical moves + 5-sec loop URLs  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null  
);

-- SECURITY ENFORCEMENT (Row-Level Security)  
alter table public.profiles enable row level security;  
alter table public.fitness_goals enable row level security;  
alter table public.user_game_state enable row level security;  
alter table public.workout_plans enable row level security;

create policy "Profiles isolated access" on public.profiles for all using (auth.uid() = id);  
create policy "Goals isolated access" on public.fitness_goals for all using (auth.uid() = user_id);  
create policy "Game state isolated access" on public.user_game_state for all using (auth.uid() = user_id);  
create policy "Workouts isolated access" on public.workout_plans for all using (auth.uid() = user_id);
