
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX expenses_user_date_idx ON public.expenses (user_id, date DESC);

CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  notes TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workouts TO authenticated;
GRANT ALL ON public.workouts TO service_role;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workouts" ON public.workouts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX workouts_user_date_idx ON public.workouts (user_id, date DESC);
