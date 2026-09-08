import { CategoryInfo, Facility, NotificationItem, TicketReport, UserProfile } from '../types';

export const initialUserProfile: UserProfile = {
  name: 'Malini S.',
  studentId: '#8842',
  email: 'malini.s@nexcampus.edu',
  program: 'B.Tech Computer Science',
  year: 'Year 3',
  campusResidence: 'Block A, Room 101, SRM Campus, Chennai',
  roomKey: 'Room #304 • Hall Key #B-304',
  term: 'Spring Semester 2025',
  enrolledCredits: 'Full-Time Enrolled (18 ECTS)',
  mentor: 'Dr. Ronald Hayes',
  mentorDept: 'CS Dept • Desk Turing 12',
};

export const masterCategories: CategoryInfo[] = [
  {
    key: 'hostel',
    name: 'Hostel',
    number: '01',
    icon: 'apartment',
    subtitle: 'Accommodation & facility issues.',
    question: 'What type of hostel issue are you reporting?',
    issues: [
      'Room Maintenance', 'Water Supply', 'Electricity', 'Room Cleanliness',
      'Bathroom / Toilet', 'Food / Mess', 'Wi-Fi / Internet', 'Furniture',
      'Pest / Insect Problem', 'Room Allocation', 'Hostel Security',
      'Noise / Disturbance', 'Laundry', 'Common Area Maintenance', 'Other Hostel Issue'
    ]
  },
  {
    key: 'student-welfare',
    name: 'Student Welfare',
    number: '02',
    icon: 'favorite',
    subtitle: 'Student services & wellbeing.',
    question: 'What wellbeing or welfare support do you need?',
    issues: [
      'Counseling / Mental Health Support', 'Health Center & First Aid',
      'Disability Accommodation Request', 'Financial / Scholarship Query',
      'Identity & Inclusion Support', 'Harassment / Grievance Redressal',
      'Emergency Financial Hardship', 'Other Student Welfare Issue'
    ]
  },
  {
    key: 'transport',
    name: 'Transport',
    number: '03',
    icon: 'directions_bus',
    subtitle: 'Buses, routes & shuttles.',
    question: 'What campus transport concern are you reporting?',
    issues: [
      'Bus / Shuttle Delays', 'Route Overcrowding', 'Driver Conduct',
      'Campus Buggy Maintenance', 'Parking Slot Violation', 'EV Charging Station Fault',
      'Bicycle Stand Issue', 'Late Night Shuttle Request', 'Other Transport Issue'
    ]
  },
  {
    key: 'college-campus',
    name: 'College / Campus',
    number: '04',
    icon: 'domain',
    subtitle: 'Classrooms, labs & grounds.',
    question: 'What facility or infrastructure issue are you reporting?',
    issues: [
      'Classroom Projector / AV Failure', 'Lab Equipment Damage', 'HVAC / Air Conditioning Failure',
      'Library Quiet Zone Violation', 'Auditorium Seating Damage', 'Drinking Water Fountain',
      'Locker Malfunction', 'Elevator Breakdown', 'Other Campus Issue'
    ]
  },
  {
    key: 'food-canteen',
    name: 'Food / Canteen',
    number: '05',
    icon: 'restaurant',
    subtitle: 'Food quality & mess hygiene.',
    question: 'What canteen or food service issue are you reporting?',
    issues: [
      'Food Quality & Taste', 'Hygiene & Foreign Contaminants', 'Water Quality in Mess',
      'Overpricing / Billing Discrepancy', 'Slow Service / Crowding', 'Special Dietary Unavailability',
      'Staff Cleanliness & Gloves', 'Mess Waste Disposal', 'Other Food / Canteen Issue'
    ]
  },
  {
    key: 'safety-security',
    name: 'Safety & Security',
    number: '06',
    icon: 'shield',
    subtitle: 'Campus safety concerns.',
    question: 'What safety or security concern are you reporting?',
    issues: [
      'CCTV Camera Blindspots', 'Dark / Poorly Lit Pathway', 'Broken Gate / Perimeter Fence',
      'Trespasser / Unauthorized Visitor', 'Theft or Lost Property', 'Fire Extinguisher Expired',
      'Emergency Panic Button Failure', 'Ragging / Bullying Report', 'Other Safety Issue'
    ]
  },
  {
    key: 'cleanliness-sanitation',
    name: 'Cleanliness & Sanitation',
    number: '07',
    icon: 'cleaning_services',
    subtitle: 'Sanitation & disposal.',
    question: 'What sanitation issue needs attention?',
    issues: [
      'Overflowing Garbage Bin', 'Washroom Deep Cleaning Required', 'Stagnant Water / Mosquito Hazard',
      'Corridor Littering', 'Spill / Slip Hazard', 'Hazardous Chemical Disposal',
      'Sanitary Pad Dispenser / Disposal Unit', 'Other Sanitation Issue'
    ]
  },
  {
    key: 'infrastructure-maintenance',
    name: 'Infrastructure & Maintenance',
    number: '08',
    icon: 'build',
    subtitle: 'Electrical & plumbing faults.',
    question: 'What maintenance issue needs campus dispatch?',
    issues: [
      'Major Electrical Power Outage', 'Plumbing Leakage / Burst Pipe', 'Ceiling / Wall Seepage',
      'Broken Window / Glass Hazard', 'Structural Crack Inspection', 'Door Lock / Handle Fault',
      'Road Pothole / Pavement Trip Hazard', 'Generator Failure', 'Other Maintenance Issue'
    ]
  },
  {
    key: 'academic',
    name: 'Academic',
    number: '09',
    icon: 'school',
    subtitle: 'Courses & faculty matters.',
    question: 'What academic or faculty matter are you reporting?',
    issues: [
      'Timetable / Exam Clash', 'Faculty Unavailability / Attendance Dispute',
      'Grading Portal Glitch', 'Course Material Missing', 'Lab Session Cancellation',
      'Academic Transcripts Delay', 'Classroom Capacity Issue', 'Other Academic Issue'
    ]
  },
  {
    key: 'substance-concern',
    name: 'Substance-Related Concern',
    number: '10',
    icon: 'health_and_safety',
    subtitle: 'Discreet support & safety.',
    question: 'Confidential Support: What safety concern are you reporting?',
    issues: [
      'Confidential Substance Triage', 'Suspected Campus Boundary Smuggling',
      'Safe Intervention / Friend Wellbeing Request', 'Rehabilitation / De-addiction Guidance',
      'Hostel Non-Smoking Zone Violation', 'Discreet Security Patrol Request',
      'Anonymous Counselor Callback', 'Other Substance-Related Concern'
    ],
    privateBadge: true
  },
  {
    key: 'other',
    name: 'Other',
    number: '11',
    icon: 'help_outline',
    subtitle: "Report an issue that doesn't fit existing categories.",
    question: 'Tell us about the problem you are facing.',
    issues: [
      'General Campus Concern', 'Facility Access Problem', 'Administrative Request',
      'Signage / Navigation Fault', 'Campus Event Disturbance', 'Unclassified Equipment'
    ]
  }
];

export const initialFacilities: Facility[] = [
  {
    id: 'library',
    name: 'Library',
    title: 'Central Academic Library',
    category: 'academic',
    categoryLabel: 'Academic',
    badge: '24/7 Zone',
    badgeType: 'resolved',
    description: '24/7 quiet study zones, research archives, lending desk & private pods.',
    location: 'Bldg 4 • Central Quad',
    hoursWeekday: '07:30 – 23:00 (Main Desks)',
    hoursWeekend: 'Open 24 Hours (Night Badging)',
    access: 'Located directly adjacent to the Main Quad Fountain. Accessible via Eastern Revolving Gates. NexCampus Student RFID verification required after 20:00 every evening.',
    phone: '+91 44 2741 7000',
    email: 'library@campus.edu',
    meshNode: 'LIB-MESH-04',
    icon: 'local_library',
    services: [
      'Silent Study Pods (Floor 3)',
      'Group Discussion Rooms (Floor 2)',
      'Digital Lending & Course Reserves',
      'High-Speed Print & Scan Hub',
      'Academic Research Librarians',
      'Microfilm & Special Archive Vault'
    ]
  },
  {
    id: 'laboratories',
    name: 'Laboratories',
    title: 'Integrated Science & Eng Labs',
    category: 'academic',
    categoryLabel: 'Academic',
    badge: '08:00 – 21:00',
    badgeType: 'progress',
    description: 'Advanced research units, hardware testing, cleanrooms & rapid fab lab.',
    location: 'Turing Hall • Tech Park',
    hoursWeekday: '08:00 – 21:00',
    hoursWeekend: '10:00 – 18:00 (Authorized Access)',
    access: 'Requires specialized safety clearance for fabrication floor and cleanrooms. Lab coat & safety goggles mandated at all times.',
    phone: '+91 44 2741 7000',
    email: 'labs@campus.edu',
    meshNode: 'TURING-LAB-01',
    icon: 'science',
    services: [
      'Rapid Fabrication Lab & 3D Printers',
      'PCB Prototyping Cleanroom',
      'Spectrometry & Chemical Storage',
      'Oscilloscopes & Hardware Benches',
      'Safety Supervisor On-Duty'
    ]
  },
  {
    id: 'classrooms',
    name: 'Classrooms',
    title: 'Lecture Theatres & Smart Halls',
    category: 'academic',
    categoryLabel: 'Academic',
    badge: 'Active Classes',
    badgeType: 'resolved',
    description: 'AV-equipped lecture halls, tutorial suites, & hybrid smart studios.',
    location: 'Blocks A, B, C & West Wing',
    hoursWeekday: '07:30 – 22:00',
    hoursWeekend: '09:00 – 18:00 (Seminar Bookings)',
    access: 'Lectures scheduled via campus timetable. Available for student study bookings outside official instructional slots.',
    phone: '+91 44 2741 7000',
    email: 'av-scheduling@campus.edu',
    meshNode: 'CLS-ZONE-W12',
    icon: 'co_present',
    services: [
      'Dual 4K Laser Projection Displays',
      'Wireless Screen Casting & Microphones',
      'Acoustic Ergonomic Tiered Seating',
      'Hybrid Teleconference Recording',
      'Universal USB-C Lap Charging'
    ]
  },
  {
    id: 'canteen',
    name: 'Canteen & Food',
    title: 'Main Dining Hall & Food Hub',
    category: 'living',
    categoryLabel: 'Living',
    badge: 'Open Now',
    badgeType: 'resolved',
    description: 'Multi-cuisine food court, organic cafe, bakery, & late-night coffee kiosks.',
    location: 'Main Canteen • 1st Fl',
    hoursWeekday: '07:00 – 23:30',
    hoursWeekend: '08:00 – 23:00',
    access: 'Open to all students, faculty, and campus visitors. Meal plan credits, Apple Pay, and campus SmartCard accepted.',
    phone: '+91 44 2741 7000',
    email: 'dining@campus.edu',
    meshNode: 'COMMONS-FOOD-02',
    icon: 'restaurant',
    services: [
      'Multi-Cuisine Hot Food Stations',
      'Halal, Vegan & Allergen-Free Counters',
      'Specialty Coffee & Espresso Bar',
      'Self-Service Salad & Soup Station',
      'Grab & Go Healthy Bento Fridges'
    ]
  },
  {
    id: 'hostel',
    name: 'Hostel',
    title: 'University Residence Halls',
    category: 'living',
    categoryLabel: 'Living',
    badge: '24/7 Access',
    badgeType: 'resolved',
    description: 'North & South Quads, common lounges, automated laundry & warden desk.',
    location: 'Hostel Blocks A & B',
    hoursWeekday: '24 Hours Daily',
    hoursWeekend: '24 Hours Daily',
    access: 'Restricted exclusively to registered resident students and authorized visitors. Night curfew badging monitored by hall wardens.',
    phone: '+91 44 2741 7000',
    email: 'reslife@campus.edu',
    meshNode: 'HOSTEL-NORTH-08',
    icon: 'apartment',
    services: [
      'Card-Operated Eco Laundromat',
      'High-Speed Resident Floor Wi-Fi',
      'Floor Kitchenettes & Microwaves',
      'Recreation & Billiards Lounge',
      'Resident Assistant Front Desk'
    ]
  },
  {
    id: 'sports',
    name: 'Sports & Recreation',
    title: 'Sports Complex & Arena',
    category: 'wellness',
    categoryLabel: 'Wellness',
    badge: 'Closes 22:00',
    badgeType: 'progress',
    description: 'Indoor badminton, Olympic pool, fitness gym, track & squash courts.',
    location: 'Sports Complex',
    hoursWeekday: '06:00 – 22:00',
    hoursWeekend: '07:00 – 20:00',
    access: 'Free access for enrolled students upon showing active NexCampus digital credential. Locker registration at reception.',
    phone: '+91 44 2741 7000',
    email: 'athletics@campus.edu',
    meshNode: 'SPORTS-ARENA-01',
    icon: 'fitness_center',
    services: [
      '50m Heated Olympic Swimming Pool',
      'State-of-the-Art Free Weights & Cardio',
      'Indoor Badminton & Squash Courts',
      'Certified Athletic Trainers On-Site',
      'Sauna & Recovery Hydrotherapy'
    ]
  },
  {
    id: 'medical',
    name: 'Medical Centre',
    title: 'University Health & Urgent Care',
    category: 'wellness',
    categoryLabel: 'Wellness',
    badge: '24/7 ER',
    badgeType: 'resolved',
    description: '24/7 emergency clinic, consultation, pharmacy & mental health support.',
    location: 'Campus Hospital • Gate 2',
    hoursWeekday: '24 Hours Daily',
    hoursWeekend: '24 Hours Daily',
    access: 'Walk-ins welcomed 24 hours. For medical emergencies on campus grounds, dial campus dispatch at SOS #0199 directly.',
    phone: '+91 44 2741 7000',
    email: 'urgent-care@campus.edu',
    meshNode: 'CLINIC-MESH-01',
    icon: 'local_hospital',
    services: [
      '24/7 Triage & Emergency Doctor',
      'Prescription Dispensing Pharmacy',
      'Student Mental Health & Counseling',
      'Rapid Diagnostics & Blood Testing',
      'Ambulance Direct Transfer Bay'
    ]
  },
  {
    id: 'transport',
    name: 'Transport',
    title: 'Campus Transit Hub',
    category: 'operations',
    categoryLabel: 'Operations',
    badge: 'Running',
    badgeType: 'resolved',
    description: 'Shuttle terminuses, e-bike sharing stands, metro loops & transit hub.',
    location: 'Main Bus Depot',
    hoursWeekday: '06:30 – 23:45',
    hoursWeekend: '07:30 – 22:30',
    access: 'Campus loop shuttles are 100% free for students and staff. Live GPS bus tracking enabled inside the NexCampus mobile client.',
    phone: '+91 44 2741 7000',
    email: 'transit@campus.edu',
    meshNode: 'TRANSIT-HUB-N1',
    icon: 'directions_bus',
    services: [
      'Loop Express Shuttle Fleet',
      'Electric Bike Share Docking Station',
      'Metro Rail Feeder Connectors',
      'Secure EV Charging Stalls (Level 2)',
      'Covered Commuter Bicycle Garages'
    ]
  },
  {
    id: 'security',
    name: 'Security',
    title: 'Campus Safety & Security HQ',
    category: 'operations',
    categoryLabel: 'Operations',
    badge: '24/7 Patrol',
    badgeType: 'resolved',
    description: '24/7 emergency dispatch, lost & found depot, quad patrols & badge desk.',
    location: 'Admin Block, Ground Floor',
    hoursWeekday: '24 Hours Daily',
    hoursWeekend: '24 Hours Daily',
    access: 'Always open for safety walk escorts, emergency dispatch, parking permits, and lost property claim.',
    phone: '+91 44 2741 7000',
    email: 'police@campus.edu',
    meshNode: 'SEC-HQ-DISPATCH',
    icon: 'shield',
    services: [
      '24/7 Emergency Dispatch Control',
      'Night Safety Escort Services',
      'Central Lost & Found Vault',
      'CCTV Quad Monitoring Desk',
      'Visitor Pass Issuance & Badging'
    ]
  },
  {
    id: 'student-services',
    name: 'Student Services',
    title: 'Student Admin & Registrar',
    category: 'academic',
    categoryLabel: 'Academic',
    badge: 'Closes 17:00',
    badgeType: 'progress',
    description: 'Academic records, scholarship desk, international visa services & ID cards.',
    location: 'University Building • Fl 2',
    hoursWeekday: '08:30 – 17:00',
    hoursWeekend: 'Closed (Online Portal Active)',
    access: 'Ticket queue number can be reserved via the app before physical arrival to eliminate lobby wait times.',
    phone: '+91 44 2741 7000',
    email: 'registrar@campus.edu',
    meshNode: 'ADMIN-REG-HALL',
    icon: 'badge',
    services: [
      'Official Transcript & Degree Verifications',
      'Tuition & Financial Aid Counseling',
      'International Visa Advising & I-20',
      'Student ID Card Replacement Desk',
      'Exam Accommodations Office'
    ]
  },
  {
    id: 'technology',
    name: 'Technology & Wi-Fi',
    title: 'IT Support & NOC Desk',
    category: 'operations',
    categoryLabel: 'Operations',
    badge: 'Online 99.9%',
    badgeType: 'resolved',
    description: 'Quadnet-5G helpdesk, software licensing, walk-in device triage & auth.',
    location: 'Tech Park • Ground',
    hoursWeekday: '08:00 – 20:00 (Chat 24/7)',
    hoursWeekend: '10:00 – 16:00',
    access: 'Walk-in technician bench for hardware diagnosis, eduroam certificates, and software licensing setup.',
    phone: '+91 44 2741 7000',
    email: 'it-support@campus.edu',
    meshNode: 'NOC-CORE-ROUTER',
    icon: 'wifi',
    services: [
      'Quadnet-5G Wi-Fi Device Configuration',
      'Hardware & Battery Triage Bar',
      'Institutional Software Licenses (CAD/Office)',
      'Single Sign-On 2FA Assistance',
      'Cloud Printing Setup & Support'
    ]
  },
  {
    id: 'common-facilities',
    name: 'Common Facilities',
    title: 'Student Activity & Amphitheatre',
    category: 'living',
    categoryLabel: 'Living',
    badge: 'Open Access',
    badgeType: 'resolved',
    description: 'Clubs, student union lounge, music rehearsal rooms & open auditorium.',
    location: 'Student Activity Center',
    hoursWeekday: '07:00 – 23:00',
    hoursWeekend: '08:00 – 23:00',
    access: 'Open to registered student clubs and campus societies. Event and rehearsal reservations managed via Portal 2.4.',
    phone: '+91 44 2741 7000',
    email: 'union@campus.edu',
    meshNode: 'SAC-AMPHI-03',
    icon: 'theater_comedy',
    services: [
      'Soundproof Acoustic Music Studios',
      'Student Union Council Lounge',
      '1,200-Seat Open-Air Amphitheatre',
      'Art Exhibition & Pop-Up Gallery',
      'Student Society Lockers & Storage'
    ]
  }
];

export const initialTicketReports: TicketReport[] = [
  {
    id: '#TK-9041',
    title: 'Wi-Fi connectivity drop in Block C - 3rd Floor',
    category: 'Hostel',
    subCategory: 'Hostel IT Support',
    location: 'Campus Zone • Block C • Floor 3 Corridor',
    reportedDate: 'Reported Yesterday',
    status: 'In Progress',
    statusText: 'In Progress',
    squad: 'IT-NOC Squad #4',
    resolutionAction: 'Replaced faulty access point AP-04 in Corridor C and verified throughput (120 Mbps steady).',
    description: 'Frequent Wi-Fi signal drops and authentication latency for quad residents in floor 3 north wing.',
    reporterName: 'Malini S.',
    reporterId: '#8842',
    satisfactionRating: 5,
    historySteps: [
      { label: 'Submitted', time: '09:15 AM', completed: true },
      { label: 'Analysed', time: '09:40 AM', completed: true },
      { label: 'Assigned', time: '10:05 AM', completed: true },
      { label: 'Acknowledged', time: '10:30 AM', completed: true },
      { label: 'In Progress', time: '11:15 AM', completed: true },
      { label: 'Resolved', time: '02:15 PM', completed: true },
      { label: 'Verification', time: 'Action Req.', completed: false, active: true },
      { label: 'Closed', time: 'Upcoming', completed: false },
    ]
  },
  {
    id: '#TK-8912',
    title: 'Water dispenser filter replacement in Canteen 2',
    category: 'Food / Canteen',
    subCategory: 'Quality & Hygiene',
    location: 'Central Dining Hall • Beverage Station 2',
    reportedDate: 'Reported Oct 12',
    status: 'Under Review',
    statusText: 'Under Review',
    squad: 'CATER-PLUMB-1',
    description: 'Low water pressure and flow rate from ambient dispenser spigot. Filter maintenance light blinking orange.',
    reporterName: 'Malini S.',
    reporterId: '#8842'
  },
  {
    id: '#TK-8620',
    title: 'Overcrowding on Route 7 morning shuttle',
    category: 'Transport',
    subCategory: 'Bus Capacity & Route Frequency',
    location: 'Campus Zone Transit Hub',
    reportedDate: 'Oct 08, 2025 • 08:30 AM',
    closedDate: 'Oct 10, 2025 • 04:15 PM',
    status: 'Closed',
    statusText: 'Completed',
    squad: 'TRANS-OPS-B',
    satisfactionRating: 5,
    resolutionAction: 'Route 7 frequency doubled during 08:00 - 09:30 AM peak hours with an auxiliary 40-seater transit vehicle deployed. Dispatch monitoring verified 0% platform spillover.',
    description: 'Shuttle at 8:15 AM is consistently full before reaching Campus Zone terminal, leaving 20+ students stranded.',
    reporterName: 'Malini S.',
    reporterId: '#8842'
  },
  {
    id: '#TK-8104',
    title: 'Flickering lights in Physics Lab 104',
    category: 'Infrastructure',
    subCategory: 'Electrical & Lighting',
    location: 'Science Block 2 • Room 104',
    reportedDate: 'Sep 29, 2025 • 11:20 AM',
    closedDate: 'Oct 02, 2025 • 02:40 PM',
    status: 'Closed',
    statusText: 'Completed',
    squad: 'ELEC-MAINT-1',
    satisfactionRating: 5,
    resolutionAction: 'Replaced 4 faulty LED ballast fixtures and upgraded capacitor array in Lab 104 West bank. Illumination test passed university lab benchmark standard (550 lux).',
    description: 'Overhead tube lights in bay 3 flickering rapidly causing eye strain during microscope lab exercises.',
    reporterName: 'Malini S.',
    reporterId: '#8842'
  },
  {
    id: '#TK-7952',
    title: 'Water pressure outage in Campus Zone Block B 2nd Floor',
    category: 'Hostel',
    subCategory: 'Plumbing & Water Supply',
    location: 'Campus Zone • Wing B',
    reportedDate: 'Sep 18, 2025 • 07:45 AM',
    closedDate: 'Sep 19, 2025 • 01:10 PM',
    status: 'Closed',
    statusText: 'Completed',
    squad: 'PLUMB-UNIT-4',
    satisfactionRating: 5,
    resolutionAction: 'Booster pump valve B-2 cleared of sediment block; nominal 2.4 bar pressure restored and pressure tests logged at 100% operational baseline across all residential risers.',
    description: 'Zero tap water pressure in floor 2 washrooms between 7:00 AM and 8:30 AM.',
    reporterName: 'Malini S.',
    reporterId: '#8842'
  },
  {
    id: '#TK-8845',
    title: 'Duplicate Wi-Fi latency report in Campus Zone Block C',
    category: 'Hostel',
    subCategory: 'IT & Network Operations',
    location: 'Access Point AP-NQ-C2',
    reportedDate: 'Oct 14, 2025 • 10:15 AM',
    closedDate: 'Oct 14, 2025 • 11:00 AM',
    status: 'Dismissed',
    statusText: 'Dismissed',
    resolutionAction: 'Duplicate report — Automatically consolidated into master incident ticket #TK-9041 already under campus Network Operations Center investigation. No further action needed from student.',
    description: 'High ping and signal drop in room 304.',
    reporterName: 'Malini S.',
    reporterId: '#8842'
  },
  {
    id: '#TK-8411',
    title: 'Cafeteria cold coffee temperature variation',
    category: 'Food / Canteen',
    subCategory: 'Quality & Dispenser Calibration',
    location: 'Central Dining Hall • Beverage Hub 1',
    reportedDate: 'Oct 04, 2025 • 01:30 PM',
    closedDate: 'Oct 05, 2025 • 09:00 AM',
    status: 'Cancelled',
    statusText: 'Cancelled',
    resolutionAction: 'Issue no longer exists — Student confirmed dispenser calibration was adjusted by counter staff and verified operating within target range before squad dispatch.',
    description: 'Cold brew counter was dispensing beverage at ambient temperature.',
    reporterName: 'Malini S.',
    reporterId: '#8842'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'reports',
    ticketId: '#TK-9041',
    subCategory: 'Network Infrastructure',
    timeAgo: '25 mins ago',
    title: 'Verification required: Wi-Fi connectivity in Block C',
    description: 'Network squad marked this incident as resolved. Please test connectivity in your corridor and confirm whether Wi-Fi speed has returned to normal.',
    isRead: false,
    badgeText: 'Action Required',
    badgeClass: 'bg-status-urgent-bg text-status-urgent-fg',
    icon: 'verified_user',
    iconClass: 'bg-status-review-bg text-status-review-fg',
    actionRequired: true,
    actionType: 'verification'
  },
  {
    id: 'notif-2',
    type: 'reports',
    ticketId: '#TK-8912',
    subCategory: 'Canteen Facilities',
    timeAgo: '2 hours ago',
    title: 'Additional information requested',
    description: 'Canteen facility team needs clarification: Is the water dispenser pressure drop affecting both cold and ambient taps in Canteen 2?',
    isRead: false,
    badgeText: 'Clarification Requested',
    badgeClass: 'bg-status-review-bg text-status-review-fg',
    icon: 'contact_support',
    iconClass: 'bg-status-progress-bg text-status-progress-fg',
    actionRequired: true,
    actionType: 'clarification'
  },
  {
    id: 'notif-3',
    type: 'alerts',
    subCategory: 'CAMPUS ALERT • TRANSPORT',
    timeAgo: '3 hours ago',
    title: 'Route 7 morning shuttle service revised',
    description: 'Campus Zone transit hub maintenance will temporarily divert Route 7 buses to East Gate terminal between 08:00 AM – 11:00 AM today.',
    isRead: false,
    badgeText: 'Urgent Transit Notice',
    badgeClass: 'bg-status-urgent-bg text-status-urgent-fg',
    icon: 'departure_board',
    iconClass: 'bg-status-urgent-bg text-status-urgent-fg',
    actionType: 'transit'
  },
  {
    id: 'notif-4',
    type: 'reports',
    ticketId: '#TK-9041',
    subCategory: 'Yesterday, 10:05 AM',
    timeAgo: 'Yesterday',
    title: 'Squad assigned to your ticket',
    description: 'IT-NOC Squad #4 has been dispatched to inspect access point AP-04 in Block C 3rd floor corridor.',
    isRead: true,
    badgeText: 'Report Update',
    badgeClass: 'bg-status-submitted-bg text-status-submitted-fg',
    icon: 'engineering',
    iconClass: 'bg-surface-container text-on-surface-variant'
  },
  {
    id: 'notif-5',
    type: 'reports',
    ticketId: '#TK-8620',
    subCategory: 'Oct 10, 2025',
    timeAgo: 'Oct 10',
    title: 'Report marked as Completed & Closed',
    description: 'Transport Operations verified auxiliary 40-seater deployment on Route 7 morning peak. Resolution confirmed.',
    isRead: true,
    badgeText: 'Closed',
    badgeClass: 'bg-status-resolved-bg text-status-resolved-fg',
    icon: 'check_circle',
    iconClass: 'bg-status-resolved-bg text-status-resolved-fg'
  },
  {
    id: 'notif-6',
    type: 'alerts',
    subCategory: 'CAMPUS ALERT • FACILITIES',
    timeAgo: 'Oct 09',
    title: 'Library 4th Floor quiet zone HVAC maintenance',
    description: 'Scheduled chiller compressor replacement completed. Central cooling returned to nominal temperature.',
    isRead: true,
    badgeText: 'Maintenance Completed',
    badgeClass: 'bg-surface-container text-on-surface-variant',
    icon: 'mode_fan',
    iconClass: 'bg-surface-container text-on-surface-variant'
  }
];
