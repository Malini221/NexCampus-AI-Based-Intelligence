-- NexCampus core database schema
-- Real application data only. No demo students, complaints, incidents, or statistics.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists vector;

create type public.user_role as enum ('student', 'staff', 'admin');
create type public.complaint_status as enum (
  'Submitted', 'Under Review', 'In Progress', 'Resolved',
  'Awaiting Verification', 'Closed', 'Dismissed', 'Cancelled'
);
create type public.incident_status as enum (
  'Open', 'Under Investigation', 'Assigned', 'In Progress',
  'Resolved', 'Awaiting Verification', 'Closed', 'Dismissed'
);
create type public.severity_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
create type public.priority_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
create type public.ai_processing_status as enum ('queued', 'processing', 'completed', 'failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  student_id text unique,
  email text,
  phone text,
  department text,
  program text,
  year integer check (year between 1 and 6),
  section text,
  residence_type text check (residence_type in ('hosteller', 'dayscholar')),
  residence text,
  room text,
  bus_number text,
  mentor text,
  role public.user_role not null default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  contact_email text,
  contact_phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null unique,
  icon text,
  subtitle text,
  question text,
  private_reporting boolean not null default false,
  default_department_id uuid references public.departments(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(category_id, name)
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  ticket_number bigint generated always as identity unique,
  student_id uuid not null references public.profiles(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
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
  is_anonymous boolean not null default false,
  status public.complaint_status not null default 'Submitted',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location_text, ''))
  ) stored,
  embedding vector(384)
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  incident_number bigint generated always as identity unique,
  category_id uuid not null references public.categories(id) on delete restrict,
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
  severity public.severity_level not null default 'LOW',
  priority public.priority_level not null default 'LOW',
  risk_score numeric(5,2) check (risk_score between 0 and 100),
  status public.incident_status not null default 'Open',
  affected_student_count integer not null default 0 check (affected_student_count >= 0),
  occurrence_count integer not null default 0 check (occurrence_count >= 0),
  first_reported_at timestamptz,
  last_reported_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.incident_complaints (
  incident_id uuid not null references public.incidents(id) on delete cascade,
  complaint_id uuid not null unique references public.complaints(id) on delete cascade,
  similarity_score numeric(5,4) check (similarity_score between -1 and 1),
  linked_by text not null default 'system' check (linked_by in ('system', 'staff')),
  created_at timestamptz not null default now(),
  primary key (incident_id, complaint_id)
);

create table public.ai_analysis (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null unique references public.complaints(id) on delete cascade,
  predicted_category_id uuid references public.categories(id) on delete set null,
  predicted_subcategory_id uuid references public.subcategories(id) on delete set null,
  severity public.severity_level,
  priority public.priority_level,
  risk_score numeric(5,2) check (risk_score between 0 and 100),
  summary text,
  recommended_department_id uuid references public.departments(id) on delete set null,
  risk_signals jsonb not null default '[]'::jsonb,
  reasoning text,
  embedding_model text,
  classifier_model text,
  processing_status public.ai_processing_status not null default 'queued',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  from_status public.complaint_status,
  to_status public.complaint_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.incident_status_history (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  from_status public.incident_status,
  to_status public.incident_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  complaint_id uuid references public.complaints(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete cascade,
  type text not null check (type in ('reports', 'alerts', 'system')),
  title text not null,
  message text not null,
  action_required boolean not null default false,
  action_type text check (action_type in ('verification', 'clarification', 'transit', 'info')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  complaint_id uuid not null unique references public.complaints(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  comments text,
  created_at timestamptz not null default now()
);

create table public.facilities (
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

create index complaints_student_idx on public.complaints(student_id);
create index complaints_category_idx on public.complaints(category_id);
create index complaints_status_idx on public.complaints(status);
create index complaints_submitted_idx on public.complaints(submitted_at desc);
create index complaints_search_idx on public.complaints using gin(search_vector);
create index complaints_title_trgm_idx on public.complaints using gin(title gin_trgm_ops);
create index complaints_description_trgm_idx on public.complaints using gin(description gin_trgm_ops);
create index complaints_embedding_idx on public.complaints using hnsw (embedding vector_cosine_ops);
create index incidents_category_idx on public.incidents(category_id);
create index incidents_department_idx on public.incidents(department_id);
create index incidents_status_idx on public.incidents(status);
create index notifications_user_idx on public.notifications(user_id, created_at desc);
create index complaint_history_complaint_idx on public.complaint_status_history(complaint_id, created_at desc);
create index incident_history_incident_idx on public.incident_status_history(incident_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger departments_updated_at before update on public.departments
for each row execute function private.set_updated_at();
create trigger categories_updated_at before update on public.categories
for each row execute function private.set_updated_at();
create trigger complaints_updated_at before update on public.complaints
for each row execute function private.set_updated_at();
create trigger incidents_updated_at before update on public.incidents
for each row execute function private.set_updated_at();
create trigger ai_analysis_updated_at before update on public.ai_analysis
for each row execute function private.set_updated_at();
create trigger facilities_updated_at before update on public.facilities
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, student_id, department, program, year, section, residence_type, residence, room, bus_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'student_id', ''),
    nullif(new.raw_user_meta_data ->> 'department', ''),
    nullif(new.raw_user_meta_data ->> 'program', ''),
    nullif(new.raw_user_meta_data ->> 'year', '')::integer,
    nullif(new.raw_user_meta_data ->> 'section', ''),
    nullif(new.raw_user_meta_data ->> 'residence_type', ''),
    nullif(new.raw_user_meta_data ->> 'residence', ''),
    nullif(new.raw_user_meta_data ->> 'room', ''),
    nullif(new.raw_user_meta_data ->> 'bus_number', '')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('staff', 'admin')
      and is_active = true
  );
$$;

revoke execute on function private.is_staff_or_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_staff_or_admin() to authenticated;

create or replace function public.find_similar_complaints(
  query_embedding vector(384),
  match_threshold double precision default 0.80,
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
    c.id,
    ic.incident_id,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.complaints c
  left join public.incident_complaints ic on ic.complaint_id = c.id
  where c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= match_threshold
    and c.status not in ('Dismissed', 'Cancelled')
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

create or replace function private.refresh_incident_counts(target_incident uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.incidents i
  set
    occurrence_count = coalesce(x.occurrence_count, 0),
    affected_student_count = coalesce(x.affected_student_count, 0),
    first_reported_at = x.first_reported_at,
    last_reported_at = x.last_reported_at
  from (
    select
      ic.incident_id,
      count(*)::integer as occurrence_count,
      count(distinct c.student_id)::integer as affected_student_count,
      min(c.submitted_at) as first_reported_at,
      max(c.submitted_at) as last_reported_at
    from public.incident_complaints ic
    join public.complaints c on c.id = ic.complaint_id
    where ic.incident_id = target_incident
    group by ic.incident_id
  ) x
  where i.id = target_incident;
$$;

create or replace function private.after_incident_complaint_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.refresh_incident_counts(coalesce(new.incident_id, old.incident_id));
  return coalesce(new, old);
end;
$$;

create trigger incident_complaints_refresh
after insert or update or delete on public.incident_complaints
for each row execute function private.after_incident_complaint_change();

-- Static application taxonomy only; no transactional/demo data.
insert into public.departments (name, description)
values
  ('Hostel & Residence', 'Hostel accommodation, rooms and residence facilities.'),
  ('IT & Network', 'Campus network, Wi-Fi, computing and digital services.'),
  ('Electrical Maintenance', 'Electrical systems, power and related maintenance.'),
  ('Civil & Infrastructure', 'Buildings, plumbing, structural and infrastructure maintenance.'),
  ('Transport', 'Campus buses, shuttles, parking and mobility services.'),
  ('Food & Canteen', 'Food service, mess and dining operations.'),
  ('Campus Security', 'Campus safety, security and emergency concerns.'),
  ('Student Welfare', 'Student support, wellbeing and welfare services.'),
  ('Academic Administration', 'Academic, timetable, faculty and examination administration.'),
  ('Sanitation', 'Cleaning, sanitation and waste management.'),
  ('General Administration', 'General campus and administrative concerns.')
on conflict (name) do nothing;

insert into public.categories (key, name, icon, subtitle, question, private_reporting, default_department_id)
select v.key, v.name, v.icon, v.subtitle, v.question, v.private_reporting,
       d.id
from (values
  ('hostel','Hostel','apartment','Accommodation & facility issues.','What type of hostel issue are you reporting?',false,'Hostel & Residence'),
  ('student-welfare','Student Welfare','favorite','Student services & wellbeing.','What wellbeing or welfare support do you need?',false,'Student Welfare'),
  ('transport','Transport','directions_bus','Buses, routes & shuttles.','What campus transport concern are you reporting?',false,'Transport'),
  ('college-campus','College / Campus','domain','Classrooms, labs & grounds.','What facility or infrastructure issue are you reporting?',false,'Civil & Infrastructure'),
  ('food-canteen','Food / Canteen','restaurant','Food quality & mess hygiene.','What canteen or food service issue are you reporting?',false,'Food & Canteen'),
  ('safety-security','Safety & Security','shield','Campus safety concerns.','What safety or security concern are you reporting?',false,'Campus Security'),
  ('cleanliness-sanitation','Cleanliness & Sanitation','cleaning_services','Sanitation & disposal.','What sanitation issue needs attention?',false,'Sanitation'),
  ('infrastructure-maintenance','Infrastructure & Maintenance','build','Electrical & plumbing faults.','What maintenance issue needs campus dispatch?',false,'Civil & Infrastructure'),
  ('academic','Academic','school','Courses & faculty matters.','What academic or faculty matter are you reporting?',false,'Academic Administration'),
  ('substance-concern','Substance-Related Concern','health_and_safety','Discreet support & safety.','Confidential Support: What safety concern are you reporting?',true,'Campus Security'),
  ('other','Other','help_outline','Report an issue that does not fit existing categories.','Tell us about the problem you are facing.',false,'General Administration')
) as v(key,name,icon,subtitle,question,private_reporting,department_name)
join public.departments d on d.name = v.department_name
on conflict (key) do nothing;

insert into public.subcategories (category_id, name)
select c.id, x.name
from public.categories c
join (values
  ('hostel','Room Maintenance'),('hostel','Water Supply'),('hostel','Electricity'),('hostel','Room Cleanliness'),('hostel','Bathroom / Toilet'),('hostel','Food / Mess'),('hostel','Wi-Fi / Internet'),('hostel','Furniture'),('hostel','Pest / Insect Problem'),('hostel','Room Allocation'),('hostel','Hostel Security'),('hostel','Noise / Disturbance'),('hostel','Laundry'),('hostel','Common Area Maintenance'),('hostel','Other Hostel Issue'),
  ('student-welfare','Counseling / Mental Health Support'),('student-welfare','Health Center & First Aid'),('student-welfare','Disability Accommodation Request'),('student-welfare','Financial / Scholarship Query'),('student-welfare','Identity & Inclusion Support'),('student-welfare','Harassment / Grievance Redressal'),('student-welfare','Emergency Financial Hardship'),('student-welfare','Other Student Welfare Issue'),
  ('transport','Bus / Shuttle Delays'),('transport','Route Overcrowding'),('transport','Driver Conduct'),('transport','Campus Buggy Maintenance'),('transport','Parking Slot Violation'),('transport','EV Charging Station Fault'),('transport','Bicycle Stand Issue'),('transport','Late Night Shuttle Request'),('transport','Other Transport Issue'),
  ('college-campus','Classroom Projector / AV Failure'),('college-campus','Lab Equipment Damage'),('college-campus','HVAC / Air Conditioning Failure'),('college-campus','Library Quiet Zone Violation'),('college-campus','Auditorium Seating Damage'),('college-campus','Drinking Water Fountain'),('college-campus','Locker Malfunction'),('college-campus','Elevator Breakdown'),('college-campus','Other Campus Issue'),
  ('food-canteen','Food Quality & Taste'),('food-canteen','Hygiene & Foreign Contaminants'),('food-canteen','Water Quality in Mess'),('food-canteen','Overpricing / Billing Discrepancy'),('food-canteen','Slow Service / Crowding'),('food-canteen','Special Dietary Unavailability'),('food-canteen','Staff Cleanliness & Gloves'),('food-canteen','Mess Waste Disposal'),('food-canteen','Other Food / Canteen Issue'),
  ('safety-security','CCTV Camera Blindspots'),('safety-security','Dark / Poorly Lit Pathway'),('safety-security','Broken Gate / Perimeter Fence'),('safety-security','Trespasser / Unauthorized Visitor'),('safety-security','Theft or Lost Property'),('safety-security','Fire Extinguisher Expired'),('safety-security','Emergency Panic Button Failure'),('safety-security','Ragging / Bullying Report'),('safety-security','Other Safety Issue'),
  ('cleanliness-sanitation','Overflowing Garbage Bin'),('cleanliness-sanitation','Washroom Deep Cleaning Required'),('cleanliness-sanitation','Stagnant Water / Mosquito Hazard'),('cleanliness-sanitation','Corridor Littering'),('cleanliness-sanitation','Spill / Slip Hazard'),('cleanliness-sanitation','Hazardous Chemical Disposal'),('cleanliness-sanitation','Sanitary Pad Dispenser / Disposal Unit'),('cleanliness-sanitation','Other Sanitation Issue'),
  ('infrastructure-maintenance','Major Electrical Power Outage'),('infrastructure-maintenance','Plumbing Leakage / Burst Pipe'),('infrastructure-maintenance','Ceiling / Wall Seepage'),('infrastructure-maintenance','Broken Window / Glass Hazard'),('infrastructure-maintenance','Structural Crack Inspection'),('infrastructure-maintenance','Door Lock / Handle Fault'),('infrastructure-maintenance','Road Pothole / Pavement Trip Hazard'),('infrastructure-maintenance','Generator Failure'),('infrastructure-maintenance','Other Maintenance Issue'),
  ('academic','Timetable / Exam Clash'),('academic','Faculty Unavailability / Attendance Dispute'),('academic','Grading Portal Glitch'),('academic','Course Material Missing'),('academic','Lab Session Cancellation'),('academic','Academic Transcripts Delay'),('academic','Classroom Capacity Issue'),('academic','Other Academic Issue'),
  ('substance-concern','Confidential Substance Triage'),('substance-concern','Suspected Campus Boundary Smuggling'),('substance-concern','Safe Intervention / Friend Wellbeing Request'),('substance-concern','Rehabilitation / De-addiction Guidance'),('substance-concern','Hostel Non-Smoking Zone Violation'),('substance-concern','Discreet Security Patrol Request'),('substance-concern','Anonymous Counselor Callback'),('substance-concern','Other Substance-Related Concern'),
  ('other','General Campus Concern'),('other','Facility Access Problem'),('other','Administrative Request'),('other','Signage / Navigation Fault'),('other','Campus Event Disturbance'),('other','Unclassified Equipment')
) as x(category_key,name) on x.category_key = c.key
on conflict (category_id, name) do nothing;

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

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant select on public.departments, public.categories, public.subcategories to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.complaints to authenticated;
grant select on public.incidents, public.incident_complaints, public.ai_analysis, public.complaint_status_history, public.incident_status_history to authenticated;
grant select, update on public.notifications to authenticated;
grant select, insert on public.feedback to authenticated;
grant select on public.facilities to authenticated;

create policy profiles_select_own_or_staff on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select private.is_staff_or_admin()));
create policy profiles_update_own_or_staff on public.profiles for update to authenticated
using ((select auth.uid()) = id or (select private.is_staff_or_admin()))
with check ((select auth.uid()) = id or (select private.is_staff_or_admin()));

create policy departments_select_authenticated on public.departments for select to authenticated using (true);
create policy categories_select_authenticated on public.categories for select to authenticated using (true);
create policy subcategories_select_authenticated on public.subcategories for select to authenticated using (true);

create policy complaints_select_own_or_staff on public.complaints for select to authenticated
using (student_id = (select auth.uid()) or (select private.is_staff_or_admin()));
create policy complaints_insert_own on public.complaints for insert to authenticated
with check (student_id = (select auth.uid()));
create policy complaints_update_own_or_staff on public.complaints for update to authenticated
using (student_id = (select auth.uid()) or (select private.is_staff_or_admin()))
with check (student_id = (select auth.uid()) or (select private.is_staff_or_admin()));

create policy incidents_select_staff on public.incidents for select to authenticated
using ((select private.is_staff_or_admin()));
create policy incident_complaints_select_own_or_staff on public.incident_complaints for select to authenticated
using (
  (select private.is_staff_or_admin()) or
  exists (select 1 from public.complaints c where c.id = complaint_id and c.student_id = (select auth.uid()))
);
create policy ai_analysis_select_own_or_staff on public.ai_analysis for select to authenticated
using (
  (select private.is_staff_or_admin()) or
  exists (select 1 from public.complaints c where c.id = complaint_id and c.student_id = (select auth.uid()))
);
create policy complaint_history_select_own_or_staff on public.complaint_status_history for select to authenticated
using (
  (select private.is_staff_or_admin()) or
  exists (select 1 from public.complaints c where c.id = complaint_id and c.student_id = (select auth.uid()))
);
create policy incident_history_select_staff on public.incident_status_history for select to authenticated
using ((select private.is_staff_or_admin()));

create policy notifications_select_own_or_staff on public.notifications for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_staff_or_admin()));
create policy notifications_update_own on public.notifications for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy feedback_select_own on public.feedback for select to authenticated
using (user_id = (select auth.uid()));
create policy feedback_insert_own on public.feedback for insert to authenticated
with check (user_id = (select auth.uid()));

create policy facilities_select_authenticated on public.facilities for select to authenticated using (is_active = true);

alter publication supabase_realtime add table public.complaints;
alter publication supabase_realtime add table public.incidents;
alter publication supabase_realtime add table public.incident_complaints;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.complaint_status_history;
alter publication supabase_realtime add table public.incident_status_history;
