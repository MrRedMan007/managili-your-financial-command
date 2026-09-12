-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.account_type AS ENUM ('cash','bank','savings','e-wallet','investment','custom');
CREATE TYPE public.tx_type AS ENUM ('income','expense');
CREATE TYPE public.category_type AS ENUM ('income','expense');
CREATE TYPE public.debt_direction AS ENUM ('owed_by_me','owed_to_me');
CREATE TYPE public.debt_status AS ENUM ('open','partially_paid','settled','overdue');
CREATE TYPE public.contribution_direction AS ENUM ('contribution','withdrawal');
CREATE TYPE public.recurring_status AS ENUM ('active','paused');
CREATE TYPE public.occurrence_status AS ENUM ('pending','confirmed','overdue','skipped');
CREATE TYPE public.recurrence_frequency AS ENUM ('daily','weekly','monthly','yearly','custom');
CREATE TYPE public.insight_severity AS ENUM ('info','warning','critical');
CREATE TYPE public.budget_period_type AS ENUM ('monthly','weekly','custom');

-- =========================
-- SHARED updated_at helper
-- =========================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================
-- PROFILES / PREFERENCES
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT,
  base_currency TEXT NOT NULL DEFAULT 'TND',
  locale TEXT NOT NULL DEFAULT 'en',
  theme TEXT NOT NULL DEFAULT 'dark',
  ai_insights_enabled BOOLEAN NOT NULL DEFAULT true,
  demo_data_seeded BOOLEAN NOT NULL DEFAULT false,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_preferences (
  user_id UUID PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'en',
  theme TEXT NOT NULL DEFAULT 'dark',
  ai_insights_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_prefs JSONB NOT NULL DEFAULT '{"bill_due":true,"bill_overdue":true,"budget_threshold":true,"goal_milestone":true,"net_worth_snapshot":true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prefs" ON public.user_preferences FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- CURRENCIES / RATES
-- =========================
CREATE TABLE public.currencies (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  minor_unit_digits SMALLINT NOT NULL DEFAULT 2
);
GRANT SELECT ON public.currencies TO authenticated;
GRANT ALL ON public.currencies TO service_role;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "currencies readable" ON public.currencies FOR SELECT TO authenticated USING (true);
INSERT INTO public.currencies (code, name, symbol, minor_unit_digits) VALUES
  ('TND','Tunisian Dinar','DT',3),
  ('EUR','Euro','EUR',2),
  ('USD','US Dollar','$',2),
  ('GBP','British Pound','GBP',2),
  ('AED','UAE Dirham','AED',2),
  ('SAR','Saudi Riyal','SAR',2),
  ('MAD','Moroccan Dirham','MAD',2),
  ('DZD','Algerian Dinar','DZD',2),
  ('CAD','Canadian Dollar','CA$',2),
  ('CHF','Swiss Franc','CHF',2);

CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(20,10) NOT NULL CHECK (rate > 0),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, from_currency, to_currency, effective_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exchange_rates TO authenticated;
GRANT ALL ON public.exchange_rates TO service_role;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rates" ON public.exchange_rates FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================
-- ACCOUNTS
-- =========================
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  type public.account_type NOT NULL DEFAULT 'bank',
  currency TEXT NOT NULL DEFAULT 'TND',
  starting_balance BIGINT NOT NULL DEFAULT 0,
  current_balance BIGINT NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own accounts" ON public.accounts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX accounts_user_idx ON public.accounts (user_id);

CREATE TABLE public.investment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  account_id UUID NOT NULL UNIQUE REFERENCES public.accounts(id) ON DELETE CASCADE,
  holding_summary_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investment_accounts TO authenticated;
GRANT ALL ON public.investment_accounts TO service_role;
ALTER TABLE public.investment_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own investment accounts" ON public.investment_accounts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================
-- CATEGORIES / MERCHANTS
-- =========================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  parent_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type public.category_type NOT NULL DEFAULT 'expense',
  icon TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own categories" ON public.categories FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX categories_user_idx ON public.categories (user_id);

CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  last_used_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchants TO authenticated;
GRANT ALL ON public.merchants TO service_role;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own merchants" ON public.merchants FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================
-- RECURRING
-- =========================
CREATE TABLE public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.tx_type NOT NULL DEFAULT 'expense',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'TND',
  frequency public.recurrence_frequency NOT NULL DEFAULT 'monthly',
  custom_interval_days INTEGER,
  next_occurrence_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.recurring_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recurring_transactions TO authenticated;
GRANT ALL ON public.recurring_transactions TO service_role;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recurring" ON public.recurring_transactions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER recurring_updated_at BEFORE UPDATE ON public.recurring_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- TRANSACTIONS
-- =========================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  type public.tx_type NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'TND',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  payment_method TEXT,
  is_recurring_instance BOOLEAN NOT NULL DEFAULT false,
  recurring_id UUID REFERENCES public.recurring_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own transactions" ON public.transactions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX transactions_user_date_idx ON public.transactions (user_id, occurred_at DESC);
CREATE INDEX transactions_account_idx ON public.transactions (account_id);
CREATE INDEX transactions_category_idx ON public.transactions (category_id);

CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  from_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  to_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  amount_from BIGINT NOT NULL CHECK (amount_from > 0),
  amount_to BIGINT NOT NULL CHECK (amount_to > 0),
  currency_from TEXT NOT NULL,
  currency_to TEXT NOT NULL,
  exchange_rate_used NUMERIC(20,10) NOT NULL DEFAULT 1,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (from_account_id <> to_account_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transfers TO authenticated;
GRANT ALL ON public.transfers TO service_role;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own transfers" ON public.transfers FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER transfers_updated_at BEFORE UPDATE ON public.transfers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX transfers_user_date_idx ON public.transfers (user_id, occurred_at DESC);

CREATE TABLE public.recurring_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  recurring_id UUID NOT NULL REFERENCES public.recurring_transactions(id) ON DELETE CASCADE,
  expected_date DATE NOT NULL,
  status public.occurrence_status NOT NULL DEFAULT 'pending',
  linked_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (recurring_id, expected_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recurring_occurrences TO authenticated;
GRANT ALL ON public.recurring_occurrences TO service_role;
ALTER TABLE public.recurring_occurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own occurrences" ON public.recurring_occurrences FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER occurrences_updated_at BEFORE UPDATE ON public.recurring_occurrences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.recurring_transactions
  ADD COLUMN last_generated_occurrence_id UUID REFERENCES public.recurring_occurrences(id) ON DELETE SET NULL;

-- =========================
-- BUDGETS
-- =========================
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  period_type public.budget_period_type NOT NULL DEFAULT 'monthly',
  amount BIGINT NOT NULL CHECK (amount > 0),
  period_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  rollover_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated;
GRANT ALL ON public.budgets TO service_role;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own budgets" ON public.budgets FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- SAVINGS
-- =========================
CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  target_amount BIGINT NOT NULL CHECK (target_amount > 0),
  current_amount BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TND',
  target_date DATE,
  priority INTEGER NOT NULL DEFAULT 1,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.savings_goals TO authenticated;
GRANT ALL ON public.savings_goals TO service_role;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals" ON public.savings_goals FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.savings_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  direction public.contribution_direction NOT NULL DEFAULT 'contribution',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.savings_contributions TO authenticated;
GRANT ALL ON public.savings_contributions TO service_role;
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own contributions" ON public.savings_contributions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================
-- DEBTS
-- =========================
CREATE TABLE public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  direction public.debt_direction NOT NULL DEFAULT 'owed_by_me',
  counterparty_name TEXT NOT NULL,
  principal_amount BIGINT NOT NULL CHECK (principal_amount > 0),
  remaining_amount BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TND',
  due_date DATE,
  status public.debt_status NOT NULL DEFAULT 'open',
  notes TEXT,
  interest_rate NUMERIC(6,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO authenticated;
GRANT ALL ON public.debts TO service_role;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own debts" ON public.debts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER debts_updated_at BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.debt_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.debt_payments TO authenticated;
GRANT ALL ON public.debt_payments TO service_role;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own debt payments" ON public.debt_payments FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================
-- ASSETS
-- =========================
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  category TEXT,
  acquisition_value BIGINT NOT NULL DEFAULT 0,
  current_value BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TND',
  acquisition_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assets" ON public.assets FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- SNAPSHOTS / NOTIFICATIONS / INSIGHTS
-- =========================
CREATE TABLE public.net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_assets BIGINT NOT NULL DEFAULT 0,
  total_liabilities BIGINT NOT NULL DEFAULT 0,
  net_worth BIGINT NOT NULL DEFAULT 0,
  base_currency TEXT NOT NULL DEFAULT 'TND',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, snapshot_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.net_worth_snapshots TO authenticated;
GRANT ALL ON public.net_worth_snapshots TO service_role;
ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own snapshots" ON public.net_worth_snapshots FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);

CREATE TABLE public.financial_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity public.insight_severity NOT NULL DEFAULT 'info',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_dismissed BOOLEAN NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_insights TO authenticated;
GRANT ALL ON public.financial_insights TO service_role;
ALTER TABLE public.financial_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own insights" ON public.financial_insights FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================
-- DERIVED BALANCE LOGIC
-- =========================
CREATE OR REPLACE FUNCTION public.recalc_account_balance(p_account_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_account_id IS NULL THEN RETURN; END IF;
  UPDATE public.accounts a
  SET current_balance = a.starting_balance
    + COALESCE((SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
                FROM public.transactions t WHERE t.account_id = a.id), 0)
    + COALESCE((SELECT SUM(tr.amount_to) FROM public.transfers tr WHERE tr.to_account_id = a.id), 0)
    - COALESCE((SELECT SUM(tr.amount_from) FROM public.transfers tr WHERE tr.from_account_id = a.id), 0)
  WHERE a.id = p_account_id;
END; $$;

CREATE OR REPLACE FUNCTION public.tg_transactions_balance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN PERFORM public.recalc_account_balance(OLD.account_id); END IF;
  IF TG_OP IN ('INSERT','UPDATE') THEN PERFORM public.recalc_account_balance(NEW.account_id); END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER transactions_balance_sync AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.tg_transactions_balance();

CREATE OR REPLACE FUNCTION public.tg_transfers_balance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN
    PERFORM public.recalc_account_balance(OLD.from_account_id);
    PERFORM public.recalc_account_balance(OLD.to_account_id);
  END IF;
  IF TG_OP IN ('INSERT','UPDATE') THEN
    PERFORM public.recalc_account_balance(NEW.from_account_id);
    PERFORM public.recalc_account_balance(NEW.to_account_id);
  END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER transfers_balance_sync AFTER INSERT OR UPDATE OR DELETE ON public.transfers
FOR EACH ROW EXECUTE FUNCTION public.tg_transfers_balance();

-- starting_balance edits (account creation/edit) must refresh cached balance
CREATE OR REPLACE FUNCTION public.tg_accounts_balance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recalc_account_balance(NEW.id);
  RETURN NULL;
END; $$;
CREATE TRIGGER accounts_balance_sync AFTER INSERT ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.tg_accounts_balance();
CREATE TRIGGER accounts_balance_resync AFTER UPDATE OF starting_balance ON public.accounts
FOR EACH ROW WHEN (OLD.starting_balance IS DISTINCT FROM NEW.starting_balance)
EXECUTE FUNCTION public.tg_accounts_balance();

-- =========================
-- DERIVED DEBT LOGIC
-- =========================
CREATE OR REPLACE FUNCTION public.recalc_debt(p_debt_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_paid BIGINT; v_debt public.debts;
BEGIN
  SELECT * INTO v_debt FROM public.debts WHERE id = p_debt_id;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT COALESCE(SUM(amount),0) INTO v_paid FROM public.debt_payments WHERE debt_id = p_debt_id;
  UPDATE public.debts SET
    remaining_amount = GREATEST(v_debt.principal_amount - v_paid, 0),
    status = CASE
      WHEN v_debt.principal_amount - v_paid <= 0 THEN 'settled'::public.debt_status
      WHEN v_debt.due_date IS NOT NULL AND v_debt.due_date < CURRENT_DATE THEN 'overdue'::public.debt_status
      WHEN v_paid > 0 THEN 'partially_paid'::public.debt_status
      ELSE 'open'::public.debt_status END
  WHERE id = p_debt_id;
END; $$;

CREATE OR REPLACE FUNCTION public.tg_debt_payments()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN PERFORM public.recalc_debt(OLD.debt_id);
  ELSE PERFORM public.recalc_debt(NEW.debt_id); END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER debt_payments_sync AFTER INSERT OR UPDATE OR DELETE ON public.debt_payments
FOR EACH ROW EXECUTE FUNCTION public.tg_debt_payments();

CREATE OR REPLACE FUNCTION public.tg_debts_sync()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recalc_debt(NEW.id);
  RETURN NULL;
END; $$;
CREATE TRIGGER debts_sync_insert AFTER INSERT ON public.debts
FOR EACH ROW EXECUTE FUNCTION public.tg_debts_sync();
CREATE TRIGGER debts_sync_update AFTER UPDATE OF principal_amount, due_date ON public.debts
FOR EACH ROW WHEN (OLD.principal_amount IS DISTINCT FROM NEW.principal_amount OR OLD.due_date IS DISTINCT FROM NEW.due_date)
EXECUTE FUNCTION public.tg_debts_sync();

-- =========================
-- DERIVED SAVINGS LOGIC
-- =========================
CREATE OR REPLACE FUNCTION public.recalc_goal(p_goal_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.savings_goals g
  SET current_amount = GREATEST(COALESCE((
    SELECT SUM(CASE WHEN c.direction = 'contribution' THEN c.amount ELSE -c.amount END)
    FROM public.savings_contributions c WHERE c.goal_id = g.id), 0), 0)
  WHERE g.id = p_goal_id;
END; $$;

CREATE OR REPLACE FUNCTION public.tg_savings_contributions()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN PERFORM public.recalc_goal(OLD.goal_id);
  ELSE PERFORM public.recalc_goal(NEW.goal_id); END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER savings_contributions_sync AFTER INSERT OR UPDATE OR DELETE ON public.savings_contributions
FOR EACH ROW EXECUTE FUNCTION public.tg_savings_contributions();

-- =========================
-- BLOCK ACCOUNT DELETION WITH HISTORY (safer default)
-- =========================
CREATE OR REPLACE FUNCTION public.tg_block_account_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.transactions WHERE account_id = OLD.id)
     OR EXISTS (SELECT 1 FROM public.transfers WHERE from_account_id = OLD.id OR to_account_id = OLD.id) THEN
    RAISE EXCEPTION 'ACCOUNT_HAS_HISTORY';
  END IF;
  RETURN OLD;
END; $$;
CREATE TRIGGER accounts_block_delete BEFORE DELETE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.tg_block_account_delete();

-- =========================
-- NET WORTH SNAPSHOT RPC
-- =========================
CREATE OR REPLACE FUNCTION public.take_net_worth_snapshot()
RETURNS public.net_worth_snapshots LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid(); v_base TEXT; v_assets BIGINT; v_liab BIGINT; v_row public.net_worth_snapshots;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  SELECT COALESCE(base_currency,'TND') INTO v_base FROM public.profiles WHERE id = v_uid;
  v_base := COALESCE(v_base, 'TND');
  SELECT COALESCE(SUM(current_balance),0) INTO v_assets FROM public.accounts WHERE user_id = v_uid AND is_archived = false;
  v_assets := v_assets + COALESCE((SELECT SUM(current_value) FROM public.assets WHERE user_id = v_uid), 0);
  SELECT COALESCE(SUM(remaining_amount),0) INTO v_liab FROM public.debts WHERE user_id = v_uid AND direction = 'owed_by_me';
  INSERT INTO public.net_worth_snapshots (user_id, snapshot_date, total_assets, total_liabilities, net_worth, base_currency)
  VALUES (v_uid, date_trunc('month', CURRENT_DATE)::date, v_assets, v_liab, v_assets - v_liab, v_base)
  ON CONFLICT (user_id, snapshot_date) DO UPDATE
    SET total_assets = EXCLUDED.total_assets, total_liabilities = EXCLUDED.total_liabilities, net_worth = EXCLUDED.net_worth
  RETURNING * INTO v_row;
  RETURN v_row;
END; $$;
REVOKE ALL ON FUNCTION public.take_net_worth_snapshot() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.take_net_worth_snapshot() TO authenticated;

-- =========================
-- DEFAULT CATEGORIES BOOTSTRAP
-- =========================
CREATE OR REPLACE FUNCTION public.bootstrap_default_categories()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  IF EXISTS (SELECT 1 FROM public.categories WHERE user_id = v_uid) THEN RETURN; END IF;
  INSERT INTO public.categories (user_id, name, type, icon, is_default) VALUES
    (v_uid,'Groceries','expense','shopping-basket',true),
    (v_uid,'Dining','expense','utensils',true),
    (v_uid,'Coffee','expense','coffee',true),
    (v_uid,'Transport','expense','car',true),
    (v_uid,'Housing','expense','home',true),
    (v_uid,'Utilities','expense','plug',true),
    (v_uid,'Health','expense','heart-pulse',true),
    (v_uid,'Shopping','expense','shopping-bag',true),
    (v_uid,'Subscriptions','expense','repeat',true),
    (v_uid,'Education','expense','book-open',true),
    (v_uid,'Balance Correction','expense','scale',true),
    (v_uid,'Other expense','expense','circle-dashed',true),
    (v_uid,'Salary','income','briefcase',true),
    (v_uid,'Freelance','income','laptop',true),
    (v_uid,'Gift','income','gift',true),
    (v_uid,'Other income','income','circle-dashed',true);
END; $$;
REVOKE ALL ON FUNCTION public.bootstrap_default_categories() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_default_categories() TO authenticated;

-- =========================
-- DEMO DATA SEED / RESET
-- =========================
CREATE OR REPLACE FUNCTION public.reset_demo_data()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  DELETE FROM public.recurring_occurrences WHERE user_id = v_uid;
  DELETE FROM public.transactions WHERE user_id = v_uid;
  DELETE FROM public.transfers WHERE user_id = v_uid;
  DELETE FROM public.recurring_transactions WHERE user_id = v_uid;
  DELETE FROM public.savings_contributions WHERE user_id = v_uid;
  DELETE FROM public.savings_goals WHERE user_id = v_uid;
  DELETE FROM public.debt_payments WHERE user_id = v_uid;
  DELETE FROM public.debts WHERE user_id = v_uid;
  DELETE FROM public.budgets WHERE user_id = v_uid;
  DELETE FROM public.assets WHERE user_id = v_uid;
  DELETE FROM public.investment_accounts WHERE user_id = v_uid;
  DELETE FROM public.accounts WHERE user_id = v_uid;
  DELETE FROM public.merchants WHERE user_id = v_uid;
  DELETE FROM public.financial_insights WHERE user_id = v_uid;
  DELETE FROM public.notifications WHERE user_id = v_uid;
  DELETE FROM public.net_worth_snapshots WHERE user_id = v_uid;
  UPDATE public.profiles SET demo_data_seeded = false WHERE id = v_uid;
END; $$;
REVOKE ALL ON FUNCTION public.reset_demo_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_demo_data() TO authenticated;

CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  a_bank UUID; a_cash UUID; a_wallet UUID; a_sav UUID;
  c_groc UUID; c_dine UUID; c_coffee UUID; c_trans UUID; c_house UUID; c_util UUID; c_sub UUID; c_sal UUID;
  g_id UUID; r_id UUID; d_id UUID;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  PERFORM public.bootstrap_default_categories();

  SELECT id INTO c_groc FROM public.categories WHERE user_id=v_uid AND name='Groceries' LIMIT 1;
  SELECT id INTO c_dine FROM public.categories WHERE user_id=v_uid AND name='Dining' LIMIT 1;
  SELECT id INTO c_coffee FROM public.categories WHERE user_id=v_uid AND name='Coffee' LIMIT 1;
  SELECT id INTO c_trans FROM public.categories WHERE user_id=v_uid AND name='Transport' LIMIT 1;
  SELECT id INTO c_house FROM public.categories WHERE user_id=v_uid AND name='Housing' LIMIT 1;
  SELECT id INTO c_util FROM public.categories WHERE user_id=v_uid AND name='Utilities' LIMIT 1;
  SELECT id INTO c_sub FROM public.categories WHERE user_id=v_uid AND name='Subscriptions' LIMIT 1;
  SELECT id INTO c_sal FROM public.categories WHERE user_id=v_uid AND name='Salary' LIMIT 1;

  INSERT INTO public.accounts (user_id,name,type,currency,starting_balance,notes)
  VALUES (v_uid,'Current account','bank','TND',5000000,'Main salary account') RETURNING id INTO a_bank;
  INSERT INTO public.accounts (user_id,name,type,currency,starting_balance)
  VALUES (v_uid,'Daily cash','cash','TND',420000) RETURNING id INTO a_cash;
  INSERT INTO public.accounts (user_id,name,type,currency,starting_balance)
  VALUES (v_uid,'E-wallet','e-wallet','TND',180000) RETURNING id INTO a_wallet;
  INSERT INTO public.accounts (user_id,name,type,currency,starting_balance)
  VALUES (v_uid,'Savings','savings','TND',3000000) RETURNING id INTO a_sav;

  INSERT INTO public.merchants (user_id,name,last_used_category_id) VALUES
    (v_uid,'Monoprix',c_groc),(v_uid,'Café L''Express',c_coffee),(v_uid,'Bolt',c_trans),
    (v_uid,'STEG',c_util),(v_uid,'Netflix',c_sub)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.transactions (user_id,account_id,type,category_id,amount,currency,occurred_at,notes) VALUES
    (v_uid,a_bank,'income',c_sal,4200000,'TND',date_trunc('month',now()) + interval '1 day','Monthly salary'),
    (v_uid,a_bank,'expense',c_house,900000,'TND',date_trunc('month',now()) + interval '2 day','Rent'),
    (v_uid,a_bank,'expense',c_util,142500,'TND',date_trunc('month',now()) + interval '3 day','Electricity'),
    (v_uid,a_cash,'expense',c_coffee,5500,'TND',now() - interval '1 hour','Espresso'),
    (v_uid,a_cash,'expense',c_coffee,4000,'TND',now() - interval '2 day',NULL),
    (v_uid,a_cash,'expense',c_trans,12000,'TND',now() - interval '1 day','Taxi'),
    (v_uid,a_wallet,'expense',c_groc,86200,'TND',now() - interval '1 day','Weekly groceries'),
    (v_uid,a_wallet,'expense',c_dine,42000,'TND',now() - interval '3 day','Lunch with friends'),
    (v_uid,a_bank,'expense',c_groc,124000,'TND',now() - interval '5 day',NULL),
    (v_uid,a_bank,'expense',c_sub,12900,'TND',now() - interval '6 day','Netflix'),
    (v_uid,a_bank,'expense',c_sub,10000,'TND',now() - interval '7 day','Spotify'),
    (v_uid,a_cash,'expense',c_dine,28000,'TND',now() - interval '8 day',NULL),
    (v_uid,a_bank,'expense',c_trans,40000,'TND',now() - interval '9 day','Fuel'),
    (v_uid,a_wallet,'expense',c_groc,64500,'TND',now() - interval '11 day',NULL),
    (v_uid,a_bank,'income',c_sal,600000,'TND',now() - interval '12 day','Side project'),
    (v_uid,a_cash,'expense',c_coffee,6000,'TND',now() - interval '13 day',NULL),
    (v_uid,a_bank,'expense',c_util,58000,'TND',now() - interval '15 day','Internet'),
    (v_uid,a_wallet,'expense',c_dine,35000,'TND',now() - interval '18 day',NULL);

  INSERT INTO public.transfers (user_id,from_account_id,to_account_id,amount_from,amount_to,currency_from,currency_to,exchange_rate_used,occurred_at,notes)
  VALUES (v_uid,a_bank,a_sav,500000,500000,'TND','TND',1,now() - interval '4 day','Monthly saving');

  INSERT INTO public.budgets (user_id,category_id,amount) VALUES (v_uid,NULL,2500000);
  INSERT INTO public.budgets (user_id,category_id,amount) VALUES (v_uid,c_groc,400000);

  INSERT INTO public.savings_goals (user_id,name,target_amount,target_date,priority)
  VALUES (v_uid,'Emergency fund',3000000,(CURRENT_DATE + interval '8 month')::date,1) RETURNING id INTO g_id;
  INSERT INTO public.savings_contributions (user_id,goal_id,amount,direction,occurred_at) VALUES
    (v_uid,g_id,400000,'contribution',now() - interval '70 day'),
    (v_uid,g_id,450000,'contribution',now() - interval '40 day'),
    (v_uid,g_id,390000,'contribution',now() - interval '10 day');

  INSERT INTO public.debts (user_id,direction,counterparty_name,principal_amount,due_date,notes)
  VALUES (v_uid,'owed_by_me','Karim',600000,(CURRENT_DATE + interval '20 day')::date,'Borrowed for laptop') RETURNING id INTO d_id;
  INSERT INTO public.debt_payments (user_id,debt_id,amount,occurred_at) VALUES (v_uid,d_id,200000,now() - interval '5 day');
  INSERT INTO public.debts (user_id,direction,counterparty_name,principal_amount,due_date)
  VALUES (v_uid,'owed_to_me','Salma',150000,(CURRENT_DATE - interval '3 day')::date);

  INSERT INTO public.recurring_transactions (user_id,account_id,name,type,category_id,amount,currency,frequency,next_occurrence_date)
  VALUES (v_uid,a_bank,'Internet · FreeNet','expense',c_util,58000,'TND','monthly',(CURRENT_DATE + interval '4 day')::date) RETURNING id INTO r_id;
  INSERT INTO public.recurring_occurrences (user_id,recurring_id,expected_date,status) VALUES
    (v_uid,r_id,(CURRENT_DATE + interval '4 day')::date,'pending'),
    (v_uid,r_id,(CURRENT_DATE + interval '34 day')::date,'pending');

  INSERT INTO public.assets (user_id,name,category,acquisition_value,current_value,acquisition_date)
  VALUES (v_uid,'Car','vehicle',28000000,24000000,(CURRENT_DATE - interval '2 year')::date);

  UPDATE public.profiles SET demo_data_seeded = true WHERE id = v_uid;
  PERFORM public.take_net_worth_snapshot();
END; $$;
REVOKE ALL ON FUNCTION public.seed_demo_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_demo_data() TO authenticated;

-- =========================
-- SELF-SERVE ACCOUNT DELETION (data wipe)
-- =========================
CREATE OR REPLACE FUNCTION public.delete_my_data()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  PERFORM public.reset_demo_data();
  DELETE FROM public.categories WHERE user_id = v_uid;
  DELETE FROM public.exchange_rates WHERE user_id = v_uid;
  DELETE FROM public.user_preferences WHERE user_id = v_uid;
  DELETE FROM public.profiles WHERE id = v_uid;
END; $$;
REVOKE ALL ON FUNCTION public.delete_my_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_data() TO authenticated;