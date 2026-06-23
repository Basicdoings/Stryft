-- Add animation pipeline columns to fitness_goals
ALTER TABLE public.fitness_goals
ADD COLUMN IF NOT EXISTS rigged_mesh_url text,
ADD COLUMN IF NOT EXISTS animated_mesh_url text,
ADD COLUMN IF NOT EXISTS tripo_rig_task_id text,
ADD COLUMN IF NOT EXISTS tripo_animation_task_id text;
