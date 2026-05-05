-- ─── Vehicles ───────────────────────────────────────────────────────────────
create table if not exists vehicles (
  id                 uuid        primary key default gen_random_uuid(),
  year               smallint    not null,
  make               text        not null,
  model              text        not null,
  trim               text,
  price              integer     not null,
  mileage            integer     not null default 0,
  fuel_type          text        not null check (fuel_type in ('Gasoline', 'Hybrid', 'Electric', 'Diesel')),
  mpg_city           smallint,
  mpg_highway        smallint,
  mpg_combined       smallint,
  seating_capacity   smallint    not null default 5,
  drivetrain         text        check (drivetrain in ('FWD', 'AWD', 'RWD', '4WD')),
  safety_features    jsonb       not null default '[]',
  safety_rating      numeric(3,1),
  reliability_score  smallint    check (reliability_score between 0 and 100),
  depreciation_rate  numeric(4,2),
  resale_value_5yr   integer,
  created_at         timestamptz not null default now()
);

-- ─── Searches (stateless — logs each query for analytics) ────────────────────
create table if not exists searches (
  id                    uuid        primary key default gen_random_uuid(),
  max_budget            integer,
  miles_per_year        integer,
  ownership_years       smallint,
  fuel_price            numeric(4,2),
  min_seats             smallint,
  fuel_type_preference  text,
  drivetrain_preference text,
  weight_total_cost     smallint,
  weight_reliability    smallint,
  weight_safety         smallint,
  weight_resale         smallint,
  down_payment          integer,
  interest_rate         numeric(5,2),
  loan_term_months      smallint,
  created_at            timestamptz not null default now()
);

-- ─── Seed data ────────────────────────────────────────────────────────────────
insert into vehicles
  (year, make, model, trim, price, mileage, fuel_type, mpg_city, mpg_highway, mpg_combined,
   seating_capacity, drivetrain, safety_features, safety_rating, reliability_score,
   depreciation_rate, resale_value_5yr)
values
  (2022, 'Toyota',    'RAV4',           'XLE',       28950, 24000, 'Gasoline', 27, 35, 30, 5, 'AWD',
   '["Pre-Collision System","Lane Departure Alert","Adaptive Cruise","Blind Spot Monitor","Rear Cross Traffic Alert"]',
   9.3, 92, 38.00, 18400),

  (2022, 'Honda',     'CR-V',           'EX',        27400, 26000, 'Gasoline', 28, 34, 30, 5, 'FWD',
   '["Honda Sensing Suite","Lane Keeping Assist","Adaptive Cruise","Forward Collision Warning"]',
   9.5, 88, 41.00, 16200),

  (2023, 'Toyota',    'RAV4 Hybrid',    'XLE',       33500, 12000, 'Hybrid',   41, 38, 40, 5, 'AWD',
   '["Pre-Collision System","Lane Departure Alert","Adaptive Cruise","Blind Spot Monitor"]',
   9.5, 94, 34.00, 22100),

  (2022, 'Mazda',     'CX-5',           'Touring',   29100, 22000, 'Gasoline', 25, 31, 28, 5, 'AWD',
   '["Radar Cruise Control","Smart Brake Support","Lane Departure Warning","Blind Spot Monitoring"]',
   9.0, 87, 39.00, 17700),

  (2023, 'Subaru',    'Forester',       'Premium',   28695, 18000, 'Gasoline', 26, 33, 29, 5, 'AWD',
   '["EyeSight Driver Assist","Automatic Pre-Collision Braking","Adaptive Cruise","Blind Spot Detection"]',
   9.2, 85, 42.00, 16600),

  (2022, 'Ford',      'Escape',         'SE',        27875, 30000, 'Gasoline', 27, 33, 30, 5, 'FWD',
   '["Ford Co-Pilot360","Pre-Collision Assist","Lane-Centering System","Blind Spot Information"]',
   8.8, 76, 45.00, 15300),

  (2023, 'Hyundai',   'Tucson',         'SEL',       28175, 15000, 'Gasoline', 26, 33, 29, 5, 'FWD',
   '["Forward Collision Avoidance","Lane Keeping Assist","Blind Spot Collision Warning","Rear Cross Traffic Alert"]',
   9.0, 80, 43.00, 16000),

  (2022, 'Kia',       'Sportage',       'EX',        27490, 28000, 'Gasoline', 25, 32, 28, 5, 'AWD',
   '["Forward Collision Avoidance","Lane Keeping Assist","Driver Attention Warning","Blind Spot Warning"]',
   8.9, 79, 44.00, 15400),

  (2023, 'Nissan',    'Rogue',          'SV',        29790, 20000, 'Gasoline', 30, 37, 33, 5, 'FWD',
   '["Intelligent Emergency Braking","Lane Departure Warning","Intelligent Cruise","Blind Spot Warning"]',
   8.7, 78, 44.00, 16900),

  (2022, 'Volkswagen','Tiguan',         'SE',        30880, 22000, 'Gasoline', 22, 29, 25, 7, 'FWD',
   '["Forward Collision Warning","Post-Collision Braking","Lane Departure Warning","Blind Spot Monitor"]',
   8.6, 74, 47.00, 16300);
