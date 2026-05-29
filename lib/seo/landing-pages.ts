import type { SeoLandingPageContent } from "@/components/seo/SeoLandingPage";

const coreLinks = [
  { href: "/features", label: "Karibu VMS Features", description: "See QR pass verification, guard dashboards, visitor rules, checkout, and admin records." },
  { href: "/pricing", label: "Visitor Management Pricing in Kenya", description: "Compare Basic, Premium, and Custom visitor management plans in Kenyan shillings." },
  { href: "/contact", label: "Book a Karibu VMS Demo", description: "Contact sales on WhatsApp to discuss a Kenya visitor management setup for your site." },
];

export const kenyaVisitorManagementContent: SeoLandingPageContent = {
  eyebrow: "Visitor management system Kenya",
  title: "Visitor Management System in Kenya for Offices, Schools, Apartments, and Buildings",
  intro: "Karibu VMS is a Kenya-focused visitor management system for digital check-in, QR visitor passes, guard dashboards, host confirmation, checkout, restricted visitor records, and cleaner visitor logs.",
  primaryKeyword: "visitor management system Kenya",
  audience: "Offices, apartments, schools, hospitals, institutions, and commercial buildings in Kenya",
  problemTitle: "Kenyan facilities need better visitor records than paper books.",
  problemText: "Paper visitor books are slow to search, easy to misread, and difficult to audit. A digital visitor management system helps teams in Kenya capture the right visitor details, manage guard workflows, and keep visitor records organized from entry to checkout.",
  benefits: [
    "Replace paper visitor books with searchable digital visitor records.",
    "Let guards register visitors quickly at the gate or reception desk.",
    "Configure phone, ID, purpose, host, vehicle, photo, and custom visitor fields.",
    "Use QR visitor passes, visitor codes, checkout, and restricted visitor checks.",
    "Support Kenyan billing needs with KES pricing and M-Pesa payment context.",
    "Keep admins, guards, hosts, and building teams working from one visitor log.",
  ],
  useCases: [
    { title: "Office visitor management Kenya", description: "Manage walk-in clients, contractors, deliveries, interviews, meetings, and host confirmation for offices." },
    { title: "Apartment visitor management Kenya", description: "Give guards a cleaner way to record residents' visitors, delivery riders, vehicles, and checkout times." },
    { title: "School visitor management Kenya", description: "Support safer school reception by recording parent visits, suppliers, appointments, and gate activity." },
  ],
  internalLinks: [
    ...coreLinks,
    { href: "/digital-visitor-logbook-kenya", label: "Digital Visitor Logbook Kenya", description: "Learn how digital logs improve search, checkout, and visitor history." },
    { href: "/qr-code-visitor-management-system", label: "QR Code Visitor Management", description: "See how QR visitor passes and visitor codes support controlled entry." },
    { href: "/visitor-management-system-nairobi", label: "Visitor Management System Nairobi", description: "A Nairobi-focused page for CBD, Westlands, Parklands, Upper Hill, and other busy locations." },
  ],
  faqs: [
    { question: "What is a visitor management system in Kenya?", answer: "It is software that helps Kenyan facilities register visitors, capture visit details, support guard approval, track checkout, and keep visitor records digitally instead of relying only on paper logbooks." },
    { question: "Can Karibu VMS work for small buildings?", answer: "Yes. A building can start with guard desk registration, visitor rules, and basic records, then add QR visitor passes, host confirmation, or advanced workflows as needed." },
    { question: "Does Karibu VMS support Kenyan payment context?", answer: "Karibu VMS pricing is shown in Kenyan shillings, and the billing workflow can support M-Pesa payment initiation and payment history." },
  ],
};

export const nairobiVisitorManagementContent: SeoLandingPageContent = {
  eyebrow: "Visitor management system Nairobi",
  title: "Visitor Management System in Nairobi for Offices, Apartments, Schools, and Commercial Buildings",
  intro: "Karibu VMS helps Nairobi facilities digitize visitor check-in, reduce manual visitor books, improve guard desk workflows, and keep clearer visitor records across reception points and gates.",
  primaryKeyword: "visitor management system Nairobi",
  audience: "CBD, Westlands, Parklands, Upper Hill, Kilimani, Industrial Area, apartments, offices, and institutions",
  problemTitle: "Busy Nairobi entrances need fast, searchable visitor records.",
  problemText: "Nairobi buildings often handle clients, deliveries, contractors, tenants, interviews, school visitors, and suppliers every day. Karibu VMS gives guards and admins a structured visitor management workflow instead of scattered books, calls, and spreadsheets.",
  benefits: [
    "Improve visitor check-in at reception desks, estate gates, and commercial entrances.",
    "Record host, department, purpose, vehicle registration, and checkout status where needed.",
    "Use QR self check-in and QR visitor passes for faster controlled visitor flow.",
    "Give Nairobi building admins searchable visitor records and billing visibility.",
    "Support multiple guards, gates, departments, and hosts from one admin dashboard.",
    "Keep restricted visitor records visible before entry decisions are made.",
  ],
  useCases: [
    { title: "Nairobi office buildings", description: "Support reception teams, tenants, and guards managing meetings, deliveries, and walk-in visitors." },
    { title: "Nairobi apartments and estates", description: "Track visitors, delivery riders, vehicles, and checkout activity at residential gates." },
    { title: "Nairobi schools and institutions", description: "Record parents, suppliers, interview guests, contractors, and authorized visits at the gate." },
  ],
  internalLinks: [
    ...coreLinks,
    { href: "/visitor-management-system-kenya", label: "Visitor Management System Kenya", description: "Read the broader Kenya page for offices, schools, apartments, and buildings." },
    { href: "/visitor-management-for-office-buildings", label: "Office Building Visitor Management", description: "See how Karibu VMS supports building receptions and office towers." },
    { href: "/digital-visitor-logbook-kenya", label: "Digital Visitor Logbook Kenya", description: "Move from paper records to searchable digital visitor logs." },
  ],
  faqs: [
    { question: "Is Karibu VMS suitable for Nairobi CBD buildings?", answer: "Yes. It is designed for busy entrances where guards need fast registration, clear visitor details, and searchable admin records." },
    { question: "Can it support more than one gate?", answer: "Yes. Karibu VMS supports entry points and guard assignment, which helps facilities with more than one entrance or reception area." },
    { question: "Can admins see visitor history?", answer: "Company admins can review visitor history, checkout state, gate context, host details, and related records based on their permissions." },
  ],
};

export const digitalLogbookContent: SeoLandingPageContent = {
  eyebrow: "Digital visitor logbook Kenya",
  title: "Digital Visitor Logbook in Kenya for Safer, Searchable Visitor Records",
  intro: "Karibu VMS replaces manual visitor books with a digital visitor logbook for Kenyan facilities that need searchable records, guard check-in, checkout, host details, and visitor rules.",
  primaryKeyword: "digital visitor logbook Kenya",
  audience: "Buildings, offices, schools, apartments, hospitals, and institutions moving away from paper logbooks",
  problemTitle: "Paper visitor books are hard to search when something happens later.",
  problemText: "A digital visitor logbook helps admins search visitor records, confirm checkout, review the host or department visited, and reduce confusion caused by handwriting or missing paper pages.",
  benefits: [
    "Create searchable visitor records instead of handwritten entries.",
    "Track check-in, approval, active visit, and checkout status.",
    "Capture only the visitor details your facility decides to request.",
    "Keep guard activity and admin records organized in one platform.",
    "Support restricted visitor checks using stronger identifiers where available.",
    "Make visitor history easier to review during incidents, audits, or follow-ups.",
  ],
  useCases: [
    { title: "Reception logbook replacement", description: "Replace front-desk notebooks with digital visitor registration and checkout." },
    { title: "Gate visitor register", description: "Give security guards a cleaner tool for visitor names, host, vehicle, time in, and time out." },
    { title: "Institution visitor records", description: "Support schools, hospitals, campuses, and offices that need reliable visitor history." },
  ],
  internalLinks: [
    ...coreLinks,
    { href: "/visitor-management-system-kenya", label: "Visitor Management System Kenya", description: "See the full Kenya-focused visitor management system page." },
    { href: "/qr-code-visitor-management-system", label: "QR Code Visitor Management", description: "Add QR registration and QR visitor passes to the digital logbook flow." },
    { href: "/visitor-management-for-office-buildings", label: "Office Building Visitor Management", description: "Use digital logs in commercial buildings and offices." },
  ],
  faqs: [
    { question: "Is a digital visitor logbook better than a paper visitor book?", answer: "A digital visitor logbook is easier to search, organize, and review. Paper books may still be simple, but they are harder to audit and can be misplaced or misread." },
    { question: "Can guards still register walk-in visitors?", answer: "Yes. Guards can register visitors from the guard dashboard and record the details enabled by the company admin." },
    { question: "Can old visitor personal data be anonymised?", answer: "Karibu VMS can support anonymisation for checked-out visitors while keeping non-sensitive operational history and billing usage separate." },
  ],
};

export const qrVisitorManagementContent: SeoLandingPageContent = {
  eyebrow: "QR code visitor management system",
  title: "QR Code Visitor Management System for Kenya Facilities",
  intro: "Karibu VMS supports QR visitor check-in, QR visitor passes, visitor codes, guard approval, host confirmation, and checkout for facilities that want a faster digital visitor flow.",
  primaryKeyword: "QR code visitor management system Kenya",
  audience: "Kenyan offices, schools, apartments, estates, hospitals, and commercial buildings using QR check-in",
  problemTitle: "QR visitor passes make check-in faster while guards stay in control.",
  problemText: "QR workflows help visitors start registration quickly while guards still review entry, confirm details, and close visits through checkout. This gives facilities speed without losing operational control.",
  benefits: [
    "Let visitors scan a QR code to start check-in from their phone.",
    "Issue QR visitor passes and visitor codes for active approved visits.",
    "Give guards a dashboard to approve, review, and check out visitors.",
    "Keep visitor pass status clear after checkout or expiry.",
    "Use visitor rules to decide what details are requested before entry.",
    "Support Kenya-focused visitor management pages and internal SEO linking.",
  ],
  useCases: [
    { title: "QR check-in at reception", description: "Visitors scan a posted QR code, enter details, and wait for guard or host workflow." },
    { title: "QR visitor pass at the gate", description: "Approved visitors can show a QR pass and code during the active visit." },
    { title: "QR visitor checkout", description: "Checkout closes the visit so the pass no longer represents an active entry." },
  ],
  internalLinks: [
    ...coreLinks,
    { href: "/visitor-management-system-kenya", label: "Visitor Management System Kenya", description: "See how QR workflows fit into the wider visitor management system." },
    { href: "/digital-visitor-logbook-kenya", label: "Digital Visitor Logbook Kenya", description: "Understand how QR check-in improves digital visitor records." },
    { href: "/visitor-management-system-nairobi", label: "Visitor Management System Nairobi", description: "Explore QR visitor management for busy Nairobi facilities." },
  ],
  faqs: [
    { question: "What is QR code visitor management?", answer: "It is a visitor workflow where guests scan a QR code to start registration or present a QR visitor pass during an active visit." },
    { question: "Can guards still approve visitors?", answer: "Yes. QR check-in does not remove the guard role. Guards can still review visitor details, approve entry, and check visitors out." },
    { question: "Does QR visitor management work for apartments?", answer: "Yes. Apartments and estates can use QR check-in for guests, deliveries, contractors, and other controlled visitor flows." },
  ],
};

export const officeBuildingContent: SeoLandingPageContent = {
  eyebrow: "Office building visitor management Kenya",
  title: "Visitor Management for Office Buildings in Kenya",
  intro: "Karibu VMS helps office buildings in Kenya manage visitors, reception check-in, host confirmation, guard approvals, departments, QR passes, checkout, and admin records.",
  primaryKeyword: "visitor management for office buildings Kenya",
  audience: "Office buildings, coworking spaces, mixed-use buildings, business parks, and commercial properties",
  problemTitle: "Office buildings need visitor records that work for tenants, guards, and admins.",
  problemText: "A busy office building may receive clients, suppliers, interview candidates, contractors, delivery riders, and tenant visitors. Karibu VMS helps organize that activity by host, department, gate, visitor status, and checkout.",
  benefits: [
    "Support reception and guard desk visitor registration.",
    "Organize hosts by department for clearer routing.",
    "Use QR visitor passes and visitor codes for approved visits.",
    "Track active visitors and checkout instead of relying on paper sign-out.",
    "Review visitor history, restricted records, and billing usage from admin dashboards.",
    "Fit Kenyan offices that need practical digital visitor management without a complicated rollout.",
  ],
  useCases: [
    { title: "Commercial office receptions", description: "Manage daily client meetings, tenant guests, suppliers, deliveries, and contractors." },
    { title: "Coworking spaces", description: "Record visitors for members, departments, meeting rooms, or front-desk teams." },
    { title: "Multi-tenant buildings", description: "Support guard workflows where visitors need host or department context before entry." },
  ],
  internalLinks: [
    ...coreLinks,
    { href: "/visitor-management-system-kenya", label: "Visitor Management System Kenya", description: "Read the main Kenya page for all facility types." },
    { href: "/visitor-management-system-nairobi", label: "Visitor Management System Nairobi", description: "A Nairobi-focused page for commercial buildings and offices." },
    { href: "/qr-code-visitor-management-system", label: "QR Code Visitor Management", description: "Use QR check-in and QR visitor passes in office buildings." },
  ],
  faqs: [
    { question: "Can Karibu VMS work for a multi-tenant office building?", answer: "Yes. You can organize hosts, departments, guards, and gates so the visitor flow fits the building's operations." },
    { question: "Can visitors be checked out?", answer: "Yes. Visitor checkout helps the system show whether a visit is still active or already closed." },
    { question: "Can office admins export or review records?", answer: "Admins can review visitor records from the dashboard and use available reporting tools based on the workspace permissions and plan." },
  ],
};
