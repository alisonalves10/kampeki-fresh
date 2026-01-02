-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN email text;

-- Update the trigger function to also copy the email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'name', 
    new.raw_user_meta_data ->> 'phone',
    new.email
  );
  RETURN new;
END;
$$;