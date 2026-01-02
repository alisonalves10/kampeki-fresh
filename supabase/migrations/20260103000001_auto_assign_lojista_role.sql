-- Auto-assign 'lojista' role to new users
-- This trigger automatically assigns the 'lojista' role when a new user is created

-- Update the handle_new_user function to also assign lojista role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile (includes email from previous migration)
  INSERT INTO public.profiles (user_id, name, phone, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'name', 
    new.raw_user_meta_data ->> 'phone',
    new.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Assign lojista role to new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'lojista')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;

