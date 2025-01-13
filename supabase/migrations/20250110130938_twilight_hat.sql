-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create combined function for new user setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  -- Create default task lists
  INSERT INTO public.task_lists (name, "order", user_id)
  VALUES 
    ('A Fazer', 0, new.id),
    ('Em Andamento', 1, new.id),
    ('Concluído', 2, new.id);
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new combined trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();