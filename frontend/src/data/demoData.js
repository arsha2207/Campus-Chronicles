// ─────────────────────────────────────────────────────────────────────────────
//  demoData.js
//  Hardcoded demo data used while the Flask backend isn't connected yet.
//  Once you wire up the real API calls in api.js, you won't need this file
//  for most pages — but you can keep it for offline testing / fallback.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_USERS = [
  {
    id: 1,
    email: 'student@campus.edu',
    password: 'student123',
    name: 'Arjun Menon',
    role: 'student',
    dept: 'Computer Science',
  },
  {
    id: 2,
    email: 'admin@campus.edu',
    password: 'admin123',
    name: 'Dr. Priya Nair',
    role: 'admin',
    dept: 'Management',
  },
]

export const DEMO_ARTICLES = [
  {
    id: 1,
    hl: "Annual Tech Fest 'Innovate 2025' Draws Record 3,000 Participants",
    sm: 'The three-day technology festival concluded with record participation, featuring robotics competitions, hackathons, and keynote addresses from industry leaders.',
    cat: 'Events',
    au: 'Arjun Menon',
    dt: 'March 4, 2025',
    mo: 'March 2025',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  },
  {
    id: 2,
    hl: 'University Tops State Rankings in Research Output for Third Year',
    sm: 'Over 240 papers published in peer-reviewed journals this academic year, maintaining the top position in the state.',
    cat: 'Academics',
    au: 'Dr. Priya Nair',
    dt: 'March 3, 2025',
    mo: 'March 2025',
    img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80',
  },
  {
    id: 3,
    hl: 'Football Team Advances to State Semifinals After Penalty Shootout',
    sm: 'In a nail-biting match, our team defeated MG University 4-3 to book their place in the state semifinals.',
    cat: 'Sports',
    au: 'Sneha K.',
    dt: 'March 3, 2025',
    mo: 'March 2025',
    img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80',
  },
  {
    id: 4,
    hl: 'New AI Research Lab Inaugurated; To Benefit 500 Students Annually',
    sm: 'The state-of-the-art AI and ML laboratory was inaugurated with 40 high-performance workstations and GPU clusters.',
    cat: 'Tech',
    au: 'Rahul Dev',
    dt: 'March 2, 2025',
    mo: 'March 2025',
    img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
  },
  {
    id: 5,
    hl: "Cultural Fest 'Kaleidoscope' Returns With 50 Events Over Three Days",
    sm: 'After a two-year hiatus, the annual cultural festival returns with dance, music, drama, and literary events.',
    cat: 'Culture',
    au: 'Meera Pillai',
    dt: 'March 2, 2025',
    mo: 'March 2025',
    img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
  },
  {
    id: 6,
    hl: 'Placement Season 2025: 85% of Final Year Students Secure Offers',
    sm: 'Top recruiters including TCS and Infosys visited campus. Average salary packages rose 18% over last year.',
    cat: 'Academics',
    au: 'Arjun Menon',
    dt: 'Feb 27, 2025',
    mo: 'February 2025',
    img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80',
  },
  {
    id: 7,
    hl: 'Opinion: Why Student Journalism Matters in the Digital Age',
    sm: 'Campus newspapers serve as vital training grounds for responsible journalism and critical thinking.',
    cat: 'Opinion',
    au: 'Prof. K. Sharma',
    dt: 'Feb 28, 2025',
    mo: 'February 2025',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80',
  },
  {
    id: 8,
    hl: 'Campus Canteen Unveils New Healthier Menu Options Under Rs.60',
    sm: '15 new healthy meal options including vegan choices priced under Rs.60 introduced following a student survey.',
    cat: 'Campus News',
    au: 'Anjali Rajan',
    dt: 'March 1, 2025',
    mo: 'March 2025',
    img: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&q=80',
  },
]

export const DEMO_PENDING = [
  {
    id: 101,
    title: 'New Library Block Opens Next Semester With 10,000 New Books',
    au: 'Rahul Dev',
    dept: 'Civil Engg',
    cat: 'Campus News',
    dt: 'Mar 4, 2025',
    body: 'The college administration announced the inauguration of the new library block housing over 10,000 new books. The six-storey building features digital reading rooms, group study spaces, and a silent zone on the top floor.',
  },
  {
    id: 102,
    title: 'Students Win National Robotics Championship for Second Year',
    au: 'Anil Kumar',
    dept: 'Electronics',
    cat: 'Tech',
    dt: 'Mar 3, 2025',
    body: 'The robotics club won the National Inter-College Robotics Championship at IIT Chennai. Team ROBO-X outperformed 120 teams from across India.',
  },
  {
    id: 103,
    title: 'Opinion: The Need for Better Mental Health Resources on Campus',
    au: 'Meera Pillai',
    dept: 'Psychology',
    cat: 'Opinion',
    dt: 'Mar 3, 2025',
    body: 'As examinations approach, many students find it difficult to cope. Our campus counselling centre, staffed by only two counsellors for 5,000 students, is overwhelmed.',
  },
  {
    id: 104,
    title: 'Annual Sports Day: Full Schedule Released',
    au: 'Sneha K.',
    dept: 'Physical Edu',
    cat: 'Sports',
    dt: 'Mar 2, 2025',
    body: 'The sports committee released the full schedule for Annual Sports Day 2025, to be held on March 20. Over 800 students expected across 25 events.',
  },
]

export const DEMO_APPROVED = [
  {
    id: 201,
    title: 'Tech Fest 2025 Concludes With Record Participation',
    au: 'Arjun Menon',
    cat: 'Events',
    dt: 'Mar 1, 2025',
  },
  {
    id: 202,
    title: 'University Tops State Research Rankings',
    au: 'Dr. Priya Nair',
    cat: 'Academics',
    dt: 'Feb 28, 2025',
  },
]

export const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    type: 'approval',
    icon: '✅',
    title: 'Your article was approved!',
    body: 'Your article has been approved and published on the front page.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'comment',
    icon: '💬',
    title: 'New comment on your article',
    body: 'Prof. Sharma commented: Excellent coverage of the event. Well written!',
    time: '4 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'announcement',
    icon: '📢',
    title: 'Editorial Meeting — Friday 4PM',
    body: 'All contributors invited to the monthly meeting in Journalism Dept., Room 204.',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 4,
    type: 'deadline',
    icon: '⏰',
    title: 'Submission Deadline Reminder',
    body: 'Articles for the March 10 edition must be submitted by tomorrow, 11:59 PM.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 5,
    type: 'approval',
    icon: '✅',
    title: 'Article published to homepage',
    body: 'Students Win Robotics Championship is now live on the Campus Chronicle homepage.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 6,
    type: 'rejection',
    icon: '❌',
    title: 'Article needs revision',
    body: 'Opinion: Campus Safety Concerns returned for revision. Please add more factual sources.',
    time: '2 days ago',
    read: true,
  },
]

export const DEMO_USERS_ADMIN = [
  { name: 'Arjun Menon',   email: 'arjun@campus.edu',  dept: 'CS',          role: 'Student', arts: 12 },
  { name: 'Dr. Priya Nair',email: 'priya@campus.edu',  dept: 'Management',  role: 'Admin',   arts: 5  },
  { name: 'Rahul Dev',     email: 'rahul@campus.edu',  dept: 'Civil',       role: 'Student', arts: 7  },
  { name: 'Meera Pillai',  email: 'meera@campus.edu',  dept: 'Psychology',  role: 'Student', arts: 4  },
]

export const DEMO_STATS = [
  { l: 'Campus News', n: 42, p: 30 },
  { l: 'Academics',   n: 28, p: 20 },
  { l: 'Sports',      n: 24, p: 17 },
  { l: 'Events',      n: 18, p: 13 },
  { l: 'Opinion',     n: 16, p: 11 },
  { l: 'Culture',     n: 14, p: 9  },
]
