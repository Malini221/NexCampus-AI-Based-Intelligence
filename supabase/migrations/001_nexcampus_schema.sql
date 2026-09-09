-- NexCampus production schema
-- Run this migration in the Supabase SQL Editor.
-- This creates the real database layer for complaints, incidents, AI analysis,
-- departments, notifications, feedback, audit history and realtime updates.
-- No demo/dummy complaint or student records are inserted.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists vector;

-- ============================================================
-- ENUMS
-- ============================================================

do $$ begin
  create type public.user_role as enum ('student', 'staff', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.complaint_status as enum (
    'Submitted', 'Under Review', 'In Progress', 'Resolved',
    'Awaiting Verification', 'Closed', 'Dismissed', 'Cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.incident_status as enum (
    'Open', 'Under Investigation', 'Assigned', 'In Progress',
    'Resolved', 'Awaiting Verification', 'Closed', 'Dismissed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.severity_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.priority_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
exception when duplicate_object then null; end $$;

-- ============================================================
-- USER / ORGANISATION TABLES
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  student_id text unique,
  email text,
  phone text,
  department text,
  program text,
  year text,
  residence text,
  room text,
  mentor text,
  role public.user_role not null default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  contact_email text,
  contact_phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null unique,
  icon text,
  subtitle text,
  question text,
  is_private boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(category_id, name)
);

-- ============================================================
-- COMPLAINTS
-- ============================================================

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  ticket_number bigint generated always as identity unique,
  student_id uuid not null references public.profiles(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  title text not null,
  description text not null,
  location_text text,
  building text,
  block text,
  floor text,
  room text,
  latitude double precision,
  longitude double precision,
  attachment_path text,
  status public.complaint_status not null default 'Submitted',
  is_anonymous boolean not null default false,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location_text, ''))
  ) stored
);

create index if not exists complaints_student_idx on public.complaints(student_id);
create index if not exists complaints_category_idx on public.complaints(category_id);
create index if not exists complaints_status_idx on public.complaints(status);
create index if not exists complaints_submitted_idx on public.complaints(submitted_at desc);
create index if not exists complaints_location_idx on public.complaints(building, block, floor, room);
create index if not exists complaints_search_idx on public.complaints using gin(search_vector);
create index if not exists complaints_description_trgm_idx on public.complaints using gin(description gin_trgm_ops);

-- ============================================================
-- INCIDENTS: one real campus problem can contain many complaints
-- ============================================================

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  incident_number bigint generated always as identity unique,
  category_id uuid references public.categories(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  title text not null,
  description text,
  location_text text,
  building text,
  block text,
  floor text,
  room text,
  latitude double precision,
  longitude double precision,
  severity public.severity_level not null default 'MEDIUM',
  priority public.priority_level not null default 'MEDIUM',
  risk_score integer check (risk_score between 0 and 100),
  status public.incident_status not null default 'Open',
  affected_student_count integer not null default 0 check (affected_student_count >= 0),
  occurrence_count integer not null default 0 check (occurrence_count >= 0),
  first_reported_at timestamptz not null default now(),
  last_reported_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists incidents_status_idx on public.incidents(status);
create index if not exists incidents_priority_idx on public.incidents(priority);
create index if not exists incidents_severity_idx on public.incidents(severity);
create index if not exists incidents_category_idx on public.incidents(category_id);
create index if not exists incidents_department_idx on public.incidents(department_id);
create index if not exists incidents_location_idx on public.incidents(building, block, floor, room);
create index if not exists incidents_recent_idx on public.incidents(last_reported_at desc);

create table if not exists public.incident_complaints (
  incident_id uuid not null references public.incidents(id) on delete cascade,
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  similarity_score numeric(5,4) check (similarity_score between 0 and 1),
  linked_by text not null default 'system',
  created_at timestamptz not null default now(),
  primary key (incident_id, complaint_id),
  unique(complaint_id)
);

create index if not exists incident_complaints_incident_idx on public.incident_complaints(incident_id);

-- ============================================================
-- AI ANALYSIS / EMBEDDINGS
-- ============================================================

create table if not exists public.ai_analysis (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null unique references public.complaints(id) on delete cascade,
  category_prediction text,
  subcategory_prediction text,
  severity public.severity_level,
  risk_score integer check (risk_score between 0 and 100),
  summary text,
  recommended_department text,
  risk_signals jsonb not null default '[]'::jsonb,
  reasoning text,
  model_name text,
  model_version text,
  processing_status text not null default 'completed'
    check (processing_status in ('queued', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 768 dimensions keeps the schema compatible with common Gemini embedding output.
-- The backend should write the embedding after generating it with the chosen model.
alter table public.complaints add column if not exists embedding vector(768);
create index if not exists complaints_embedding_idx
  on public.complaints using hnsw (embedding vector_cosine_ops);

-- Find likely existing complaints/incidents before creating a new incident.
create or replace function public.find_similar_complaints(
  query_embedding vector(768),
  match_threshold double precision default 0.82,
  match_count integer default 10
)
returns table (
  complaint_id uuid,
  incident_id uuid,
  similarity double precision
)
language sql
stable
as $$
  select
    c.id as complaint_id,
    ic.incident_id,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.complaints c
  left join public.incident_complaints ic on ic.complaint_id = c.id
  where c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= match_threshold
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

-- ============================================================
-- INCIDENT / COMPLAINT HISTORY
-- ============================================================

create table if not exists public.complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  old_status public.complaint_status,
  new_status public.complaint_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists complaint_history_idx on public.complaint_status_history(complaint_id, created_at desc);

create table if not exists public.incident_status_history (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  old_status public.incident_status,
  new_status public.incident_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists incident_history_idx on public.incident_status_history(incident_id, created_at desc);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  complaint_id uuid references public.complaints(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete cascade,
  type text not null check (type in ('reports', 'alerts', 'system')),
  title text not null,
  message text,
  action_required boolean not null default false,
  action_type text check (action_type in ('verification', 'clarification', 'transit', 'info')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications(user_id, is_read) where is_read = false;

-- ============================================================
-- FEEDBACK
-- ============================================================

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  complaint_id uuid references public.complaints(id) on delete set null,
  rating integer check (rating between 1 and 5),
  comments text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_user_idx on public.feedback(user_id);

-- ============================================================
-- FACILITIES / CAMPUS RESOURCES
-- ============================================================

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  title text,
  category text,
  badge text,
  description text,
  location text,
  hours_weekday text,
  hours_weekend text,
  access text,
  phone text,
  email text,
  icon text,
  services jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- COMMON TRIGGERS
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists complaints_updated_at on public.complaints;
create trigger complaints_updated_at before update on public.complaints
for each row execute function public.set_updated_at();

drop trigger if exists incidents_updated_at on public.incidents;
create trigger incidents_updated_at before update on public.incidents
for each row execute function public.set_updated_at();

drop trigger if exists ai_analysis_updated_at on public.ai_analysis;
create trigger ai_analysis_updated_at before update on public.ai_analysis
for each row execute function public.set_updated_at();

drop trigger if exists facilities_updated_at on public.facilities;
create trigger facilities_updated_at before update on public.facilities
for each row execute function public.set_updated_at();

-- Automatically create a profile whenever a new Supabase Auth user signs up.
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1), 'Student'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- INCIDENT COUNTERS / AGGREGATION
-- ============================================================

create or replace function public.refresh_incident_counts(target_incident uuid)
returns void
security definer set search_path = public
language plpgsql
as $$
begin
  update public.incidents i
  set
    occurrence_count = coalesce(x.complaint_count, 0),
    affected_student_count = coalesce(x.student_count, 0),
    last_reported_at = coalesce(x.last_reported, i.last_reported_at),
    updated_at = now()
  from (
    select
      ic.incident_id,
      count(*)::integer as complaint_count,
      count(distinct c.student_id)::integer as student_count,
      max(c.submitted_at) as last_reported
    from public.incident_complaints ic
    join public.complaints c on c.id = ic.complaint_id
    where ic.incident_id = target_incident
    group by ic.incident_id
  ) x
  where i.id = target_incident;
end;
$$;

create or replace function public.after_complaint_link()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.refresh_incident_counts(new.incident_id);
  return new;
end;
$$;

drop trigger if exists incident_link_counts on public.incident_complaints;
create trigger incident_link_counts
after insert or delete on public.incident_complaints
for each row execute function public.after_complaint_link();

-- ============================================================
-- DASHBOARD VIEWS
-- ============================================================

create or replace view public.incident_dashboard as
select
  i.id,
  i.incident_number,
  i.title,
  i.description,
  i.location_text,
  i.building,
  i.block,
  i.floor,
  i.room,
  i.severity,
  i.priority,
  i.risk_score,
  i.status,
  i.affected_student_count,
  i.occurrence_count,
  i.first_reported_at,
  i.last_reported_at,
  i.resolved_at,
  c.name as category_name,
  d.name as department_name
from public.incidents i
left join public.categories c on c.id = i.category_id
left join public.departments d on d.id = i.department_id;

create or replace view public.student_complaint_dashboard as
select
  c.id,
  c.ticket_number,
  c.student_id,
  c.title,
  c.description,
  c.location_text,
  c.status,
  c.submitted_at,
  c.updated_at,
  c.resolved_at,
  cat.name as category_name,
  sub.name as subcategory_name,
  i.id as incident_id,
  i.incident_number,
  i.status as incident_status,
  i.severity,
  i.priority,
  i.risk_score
from public.complaints c
left join public.categories cat on cat.id = c.category_id
left join public.subcategories sub on sub.id = c.subcategory_id
left join public.incident_complaints ic on ic.complaint_id = c.id
left join public.incidents i on i.id = ic.incident_id;

-- ============================================================
-- ROLE HELPER FOR RLS
-- ============================================================

create or replace function public.has_role(required_role public.user_role)
returns boolean
security definer
set search_path = public
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = required_role
      and is_active = true
  );
$$;

create or replace function public.is_staff_or_admin()
returns boolean
security definer
set search_path = public
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('staff', 'admin')
      and is_active = true
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.complaints enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_complaints enable row level security;
alter table public.ai_analysis enable row level security;
alter table public.complaint_status_history enable row level security;
alter table public.incident_status_history enable row level security;
alter table public.notifications enable row level security;
alter table public.feedback enable row level security;
alter table public.facilities enable row level security;

-- Profiles
 drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (auth.uid() = id or public.is_staff_or_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (auth.uid() = id or public.has_role('admin'))
with check (auth.uid() = id or public.has_role('admin'));

-- Public configuration for authenticated users
 drop policy if exists departments_authenticated_read on public.departments;
create policy departments_authenticated_read on public.departments
for select to authenticated using (is_active = true or public.is_staff_or_admin());

drop policy if exists categories_authenticated_read on public.categories;
create policy categories_authenticated_read on public.categories
for select to authenticated using (is_active = true or public.is_staff_or_admin());

drop policy if exists subcategories_authenticated_read on public.subcategories;
create policy subcategories_authenticated_read on public.subcategories
for select to authenticated using (is_active = true or public.is_staff_or_admin());

drop policy if exists facilities_authenticated_read on public.facilities;
create policy facilities_authenticated_read on public.facilities
for select to authenticated using (is_active = true or public.is_staff_or_admin());

-- Complaints: students own their records; staff/admin can operate the queue.
drop policy if exists complaints_select_own_or_staff on public.complaints;
create policy complaints_select_own_or_staff on public.complaints
for select using (auth.uid() = student_id or public.is_staff_or_admin());

drop policy if exists complaints_insert_own on public.complaints;
create policy complaints_insert_own on public.complaints
for insert with check (auth.uid() = student_id);

drop policy if exists complaints_update_own_or_staff on public.complaints;
create policy complaints_update_own_or_staff on public.complaints
for update using (auth.uid() = student_id or public.is_staff_or_admin())
with check (auth.uid() = student_id or public.is_staff_or_admin());

-- Incidents are operational data; only staff/admin can read/write the full incident queue.
drop policy if exists incidents_staff_all on public.incidents;
create policy incidents_staff_all on public.incidents
for all using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

-- Students can see only incident links attached to their own complaints.
drop policy if exists incident_complaints_student_read on public.incident_complaints;
create policy incident_complaints_student_read on public.incident_complaints
for select using (
  public.is_staff_or_admin()
  or exists (
    select 1 from public.complaints c
    where c.id = complaint_id and c.student_id = auth.uid()
  )
);

drop policy if exists incident_complaints_staff_write on public.incident_complaints;
create policy incident_complaints_staff_write on public.incident_complaints
for all using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

-- AI output is staff-visible. Students can see analysis attached to their own complaint.
drop policy if exists ai_analysis_student_or_staff_read on public.ai_analysis;
create policy ai_analysis_student_or_staff_read on public.ai_analysis
for select using (
  public.is_staff_or_admin()
  or exists (
    select 1 from public.complaints c
    where c.id = complaint_id and c.student_id = auth.uid()
  )
);

drop policy if exists ai_analysis_staff_write on public.ai_analysis;
create policy ai_analysis_staff_write on public.ai_analysis
for all using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

-- Histories
 drop policy if exists complaint_history_read on public.complaint_status_history;
create policy complaint_history_read on public.complaint_status_history
for select using (
  public.is_staff_or_admin()
  or exists (select 1 from public.complaints c where c.id = complaint_id and c.student_id = auth.uid())
);

drop policy if exists complaint_history_staff_write on public.complaint_status_history;
create policy complaint_history_staff_write on public.complaint_status_history
for insert with check (public.is_staff_or_admin());

drop policy if exists incident_history_read on public.incident_status_history;
create policy incident_history_read on public.incident_status_history
for select using (public.is_staff_or_admin());

drop policy if exists incident_history_staff_write on public.incident_status_history;
create policy incident_history_staff_write on public.incident_status_history
for insert with check (public.is_staff_or_admin());

-- Notifications belong only to the recipient.
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications
for select using (auth.uid() = user_id or public.is_staff_or_admin());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
for update using (auth.uid() = user_id or public.is_staff_or_admin())
with check (auth.uid() = user_id or public.is_staff_or_admin());

drop policy if exists notifications_staff_insert on public.notifications;
create policy notifications_staff_insert on public.notifications
for insert with check (public.is_staff_or_admin());

-- Feedback: students can submit/read their own feedback.
drop policy if exists feedback_own on public.feedback;
create policy feedback_own on public.feedback
for select using (auth.uid() = user_id or public.is_staff_or_admin());

drop policy if exists feedback_insert_own on public.feedback;
create policy feedback_insert_own on public.feedback
for insert with check (auth.uid() = user_id);

-- ============================================================
-- SEED ONLY STATIC TAXONOMY / DEPARTMENTS (NOT DUMMY USER DATA)
-- ============================================================

insert into public.departments (name, description)
values
  ('Hostel & Residence', 'Hostel, room, water, sanitation and residence operations.'),
  ('IT & Network', 'Campus Wi-Fi, internet, systems and networking.'),
  ('Electrical Maintenance', 'Electrical power, lighting and electrical safety.'),
  ('Civil & Infrastructure', 'Buildings, plumbing, lifts, roads and structural maintenance.'),
  ('Transport', 'Campus buses, shuttles, parking and mobility operations.'),
  ('Food & Canteen', 'Dining, mess, food quality and hygiene operations.'),
  ('Campus Security', 'Security, CCTV, access control and safety response.'),
  ('Student Welfare', 'Counselling, welfare, disability and student support.'),
  ('Academic Administration', 'Academic services, classrooms, timetable and faculty matters.'),
  ('Sanitation', 'Cleaning, waste disposal and sanitation operations.'),
  ('General Administration', 'General campus requests and administrative routing.')
on conflict (name) do nothing;

insert into public.categories (key, name, icon, subtitle, question, is_private)
values
  ('hostel', 'Hostel', 'apartment', 'Accommodation & facility issues.', 'What type of hostel issue are you reporting?', false),
  ('student-welfare', 'Student Welfare', 'favorite', 'Student services & wellbeing.', 'What wellbeing or welfare support do you need?', false),
  ('transport', 'Transport', 'directions_bus', 'Buses, routes & shuttles.', 'What campus transport concern are you reporting?', false),
  ('college-campus', 'College / Campus', 'domain', 'Classrooms, labs & grounds.', 'What facility or infrastructure issue are you reporting?', false),
  ('food-canteen', 'Food / Canteen', 'restaurant', 'Food quality & mess hygiene.', 'What canteen or food service issue are you reporting?', false),
  ('safety-security', 'Safety & Security', 'shield', 'Campus safety concerns.', 'What safety or security concern are you reporting?', false),
  ('cleanliness-sanitation', 'Cleanliness & Sanitation', 'cleaning_services', 'Sanitation & disposal.', 'What sanitation issue needs attention?', false),
  ('infrastructure-maintenance', 'Infrastructure & Maintenance', 'build', 'Electrical & plumbing faults.', 'What maintenance issue needs campus dispatch?', false),
  ('academic', 'Academic', 'school', 'Courses & faculty matters.', 'What academic or faculty matter are you reporting?', false),
  ('substance-concern', 'Substance-Related Concern', 'health_and_safety', 'Discreet support & safety.', 'Confidential Support: What safety concern are you reporting?', true),
  ('other', 'Other', 'help_outline', 'Other campus concerns.', 'Tell us about the problem you are facing.', false)
on conflict (key) do nothing;

-- Exact issue taxonomy used by the current frontend. These are configuration values,
-- not fake complaints or fake activity.
insert into public.subcategories (category_id, name)
select c.id, x.name
from public.categories c
join (values
  ('hostel','Room Maintenance'), ('hostel','Water Supply'), ('hostel','Electricity'), ('hostel','Room Cleanliness'), ('hostel','Bathroom / Toilet'), ('hostel','Food / Mess'), ('hostel','Wi-Fi / Internet'), ('hostel','Furniture'), ('hostel','Pest / Insect Problem'), ('hostel','Room Allocation'), ('hostel','Hostel Security'), ('hostel','Noise / Disturbance'), ('hostel','Laundry'), ('hostel','Common Area Maintenance'), ('hostel','Other Hostel Issue'),
  ('student-welfare','Counseling / Mental Health Support'), ('student-welfare','Health Center & First Aid'), ('student-welfare','Disability Accommodation Request'), ('student-welfare','Financial / Scholarship Query'), ('student-welfare','Identity & Inclusion Support'), ('student-welfare','Harassment / Grievance Redressal'), ('student-welfare','Emergency Financial Hardship'), ('student-welfare','Other Student Welfare Issue'),
  ('transport','Bus / Shuttle Delays'), ('transport','Route Overcrowding'), ('transport','Driver Conduct'), ('transport','Campus Buggy Maintenance'), ('transport','Parking Slot Violation'), ('transport','EV Charging Station Fault'), ('transport','Bicycle Stand Issue'), ('transport','Late Night Shuttle Request'), ('transport','Other Transport Issue'),
  ('college-campus','Classroom Projector / AV Failure'), ('college-campus','Lab Equipment Damage'), ('college-campus','HVAC / Air Conditioning Failure'), ('college-campus','Library Quiet Zone Violation'), ('college-campus','Auditorium Seating Damage'), ('college-campus','Drinking Water Fountain'), ('college-campus','Locker Malfunction'), ('college-campus','Elevator Breakdown'), ('college-campus','Other Campus Issue'),
  ('food-canteen','Food Quality & Taste'), ('food-canteen','Hygiene & Foreign Contaminants'), ('food-canteen','Water Quality in Mess'), ('food-canteen','Overpricing / Billing Discrepancy'), ('food-canteen','Slow Service / Crowding'), ('food-canteen','Special Dietary Unavailability'), ('food-canteen','Staff Cleanliness & Gloves'), ('food-canteen','Mess Waste Disposal'), ('food-canteen','Other Food / Canteen Issue'),
  ('safety-security','CCTV Camera Blindspots'), ('safety-security','Dark / Poorly Lit Pathway'), ('safety-security','Broken Gate / Perimeter Fence'), ('safety-security','Trespasser / Unauthorized Visitor'), ('safety-security','Theft or Lost Property'), ('safety-security','Fire Extinguisher Expired'), ('safety-security','Emergency Panic Button Failure'), ('safety-security','Ragging / Bullying Report'), ('safety-security','Other Safety Issue'),
  ('cleanliness-sanitation','Overflowing Garbage Bin'), ('cleanliness-sanitation','Washroom Deep Cleaning Required'), ('cleanliness-sanitation','Stagnant Water / Mosquito Hazard'), ('cleanliness-sanitation','Corridor Littering'), ('cleanliness-sanitation','Spill / Slip Hazard'), ('cleanliness-sanitation','Hazardous Chemical Disposal'), ('cleanliness-sanitation','Sanitary Pad Dispenser / Disposal Unit'), ('cleanliness-sanitation','Other Sanitation Issue'),
  ('infrastructure-maintenance','Major Electrical Power Outage'), ('infrastructure-maintenance','Plumbing Leakage / Burst Pipe'), ('infrastructure-maintenance','Ceiling / Wall Seepage'), ('infrastructure-maintenance','Broken Window / Glass Hazard'), ('infrastructure-maintenance','Structural Crack Inspection'), ('infrastructure-maintenance','Door Lock / Handle Fault'), ('infrastructure-maintenance','Road Pothole / Pavement Trip Hazard'), ('infrastructure-maintenance','Generator Failure'), ('infrastructure-maintenance','Other Maintenance Issue'),
  ('academic','Timetable / Exam Clash'), ('academic','Faculty Unavailability / Attendance Dispute'), ('academic','Grading Portal Glitch'), ('academic','Course Material Missing'), ('academic','Lab Session Cancellation'), ('academic','Academic Transcripts Delay'), ('academic','Classroom Capacity Issue'), ('academic','Other Academic Issue'),
  ('substance-concern','Confidential Substance Triage'), ('substance-concern','Suspected Campus Boundary Smuggling'), ('substance-concern','Safe Intervention / Friend Wellbeing Request'), ('substance-concern','Rehabilitation / De-addiction Guidance'), ('substance-concern','Hostel Non-Smoking Zone Violation'), ('substance-concern','Discreet Security Patrol Request'), ('substance-concern','Anonymous Counselor Callback'), ('substance-concern','Other Substance-Related Concern'),
  ('other','General Campus Concern'), ('other','Facility Access Problem'), ('other','Administrative Request'), ('other','Signage / Navigation Fault'), ('other','Campus Event Disturbance'), ('other','Unclassified Equipment')
) as x(category_key, name) on c.key = x.category_key
on conflict (category_id, name) do nothing;

-- ============================================================
-- REALTIME
-- ============================================================

-- Supabase Realtime listens to these database changes so the React dashboard can
-- update immediately without polling or refreshing the page.
alter publication supabase_realtime add table public.complaints;
alter publication supabase_realtime add table public.incidents;
alter publication supabase_realtime add table public.incident_complaints;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.complaint_status_history;
alter publication supabase_realtime add table public.incident_status_history;

-- ============================================================
-- STORAGE BUCKET FOR REAL ATTACHMENTS
-- ============================================================

insert into storage.buckets (id, name, public)
values ('complaint-attachments', 'complaint-attachments', false)
on conflict (id) do nothing;

create policy "students upload complaint attachments"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'complaint-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "students read own complaint attachments"
on storage.objects for select to authenticated
using (
  bucket_id = 'complaint-attachments'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff_or_admin())
);

create policy "students delete own complaint attachments"
on storage.objects for delete to authenticated
using (
  bucket_id = 'complaint-attachments'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff_or_admin())
);
