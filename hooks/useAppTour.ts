"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { driver, type DriveStep } from "driver.js";
import "@/styles/driver-tour.css";

const STORAGE_KEY = "karibu_admin_tour_completed";

export const PLATFORM_TOUR_STEPS: DriveStep[] = [
  {
    element: "#tour-overview-header",
    popover: {
      title: "Welcome to Karibu VMS 👋",
      description: "This is your primary administrative command center. From here you can monitor real-time visitor traffic, export reports, and oversee facility access.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-stats-grid",
    popover: {
      title: "Real-Time Occupancy & Metrics",
      description: "Quickly view who is currently inside your facility, total check-ins today, pending approvals awaiting security review, and lifetime records.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-export-pdf",
    popover: {
      title: "Instant PDF Reports",
      description: "Export filtered visitor logs to a branded PDF report with one click for management meetings, security audits, or compliance.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: "#tour-visitor-log",
    popover: {
      title: "Master Visitor Log",
      description: "Search by name, plate number, or company. Filter by gate, date range, or approval status. Click on any visitor row to view badges or enlarge check-in photos.",
      side: "top",
      align: "start",
    },
  },
  {
    element: "#tour-sidebar-qr",
    popover: {
      title: "Gate QR Self Check-In",
      description: "Download and print touchless QR posters for your entrance gates. Visitors scan with their mobile camera to check in or pre-register without paper books.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#tour-sidebar-guards",
    popover: {
      title: "Security Team & Gate Desks",
      description: "Create and manage guard accounts for reception and physical gates. Guards log in to scan digital visitor passes and register walk-ins.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#tour-sidebar-security",
    popover: {
      title: "Security Center & Watchlist",
      description: "Maintain a restricted visitors list to automatically flag suspicious persons or barred individuals, and configure verification methods (QR Pass or SMS OTP).",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#tour-sidebar-rules",
    popover: {
      title: "Building Rules & Custom Form",
      description: "Customize the questions visitors answer during check-in (e.g. National ID, vehicle plate, NDA agreements) and set operating hours.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#tour-sidebar-departments",
    popover: {
      title: "Departments & Tenant Hosts",
      description: "Organize your facility into departments or tenant offices and assign hosts so incoming visitors can select and notify the right person.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#tour-sidebar-billing",
    popover: {
      title: "Billing & M-Pesa Payments",
      description: "Track your included visitor quotas, view monthly statements, and initiate instant M-Pesa payments when due.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#tour-sidebar-settings",
    popover: {
      title: "Account & Company Branding",
      description: "Upload your organization logo, configure dynamic building terminology, generate PMS Directory Sync API keys, or anonymise historic data.",
      side: "right",
      align: "center",
    },
  },
];

export const QR_TOUR_STEPS: DriveStep[] = [
  {
    element: "#tour-qr-header",
    popover: {
      title: "Gate QR Self Check-In & Checkout Posters",
      description: "Generate and print touchless QR posters for all entrance and departure gates. Visitors scan them using their mobile browser without downloading any apps.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-qr-print-btn",
    popover: {
      title: "One-Click Print Ready Posters",
      description: "Tap here to print clean, professional A4 posters designed with clear 1-2-3 instructions to display at your reception desk or security gate.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: "#tour-qr-checkin-card",
    popover: {
      title: "Visitor Check-in Poster",
      description: "This poster carries your facility's unique, rotating QR code for arrival registration. Scanning it opens the visitor intake form.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#tour-qr-checkin-link",
    popover: {
      title: "Direct Check-in URL",
      description: "Copy this URL to integrate with digital reception tablets, gate kiosks, or to send to visitors ahead of their arrival.",
      side: "top",
      align: "start",
    },
  },
  {
    element: "#tour-qr-checkout-card",
    popover: {
      title: "Visitor Checkout Poster",
      description: "Place this poster at departure exits. Departing guests scan and type their visitor pass code to instantly close their active visit.",
      side: "left",
      align: "start",
    },
  },
  {
    element: "#tour-qr-checkout-link",
    popover: {
      title: "Direct Checkout URL",
      description: "Use this link at checkout stations or security barrier kiosks for quick exit processing.",
      side: "top",
      align: "start",
    },
  },
];

export const GUARDS_TOUR_STEPS: DriveStep[] = [
  {
    element: "#tour-guards-header",
    popover: {
      title: "Security Team & Entry Points",
      description: "Oversee security guard logins, monitor assigned entry gates, and provision dedicated access accounts for your physical reception team.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-guards-stats",
    popover: {
      title: "Guard Force Overview",
      description: "Monitor live counts of registered guard accounts, physical entry gates, and station assignments across your property.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-guards-tabs",
    popover: {
      title: "Guards & Gates Navigation",
      description: "Easily switch between managing guard accounts and defining entry points like Main Gate, Barrier 1, or Reception Desk.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-guards-add-btn",
    popover: {
      title: "Register New Guard",
      description: "Add a security guard account with a secure password and assign them to a designated gate desk.",
      side: "left",
      align: "center",
    },
  },
  {
    element: "#tour-guards-card",
    popover: {
      title: "Guards Directory & Credentials",
      description: "View guard stations, update credentials, change passwords, or revoke guard logins with a single click.",
      side: "top",
      align: "start",
    },
  },
];

export const SECURITY_TOUR_STEPS: DriveStep[] = [
  {
    element: "#tour-security-header",
    popover: {
      title: "Security Command Center",
      description: "Review security incident reports submitted by gate guards and maintain a restricted watchlist to prevent unauthorized entry.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-security-tabs",
    popover: {
      title: "Incident Reports & Blacklist",
      description: "Toggle between guard-reported gate incidents and your active restricted visitors registry.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-security-reports",
    popover: {
      title: "Incident Audit Trail",
      description: "Review access violations, emergency alerts, or suspicious visitor attempts submitted from gate desks with one-click admin action.",
      side: "top",
      align: "start",
    },
  },
  {
    element: "#tour-security-watchlist-card",
    popover: {
      title: "Restricted Visitors Watchlist",
      description: "Restricted visitors are automatically flagged at the gate if their phone number, National ID/Passport, or vehicle plate matches this list.",
      side: "top",
      align: "start",
    },
  },
  {
    element: "#tour-security-add-btn",
    popover: {
      title: "Bar an Individual",
      description: "Add a barred individual with mandatory identifier criteria, expiry period, and security incident rationale.",
      side: "left",
      align: "center",
    },
  },
];

export const RULES_TOUR_STEPS: DriveStep[] = [
  {
    element: "#tour-rules-header",
    popover: {
      title: "Visitor Intake Policies & Rules",
      description: "Define the exact information guests must submit before entering, configure approval flows, and set up geographic boundary checks.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-rules-required",
    popover: {
      title: "Required Visitor Details",
      description: "Toggle required fields on the public check-in form, including Phone Number, ID / Passport, Visit Purpose, and Vehicle License Plate.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#tour-rules-host",
    popover: {
      title: "Host Selection & Approval",
      description: "Require visitors to choose which host, tenant, or department they are visiting so hosts are instantly notified of arrival.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#tour-rules-photo",
    popover: {
      title: "Security Photo Capture",
      description: "Require a real-time selfie on mobile check-in before entry is authorized for maximum front-desk auditability.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#tour-rules-verification",
    popover: {
      title: "Verification Method",
      description: "Choose your active verification path: locked digital QR passes verified by guard scanners or standard digital check-ins.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#tour-rules-custom",
    popover: {
      title: "Custom Facility Questions",
      description: "Add specialized questions to your entry form such as equipment serial numbers, health declarations, or contractor permits.",
      side: "left",
      align: "start",
    },
  },
  {
    element: "#tour-rules-geofence",
    popover: {
      title: "Geofenced Check-In Radius",
      description: "Restrict self check-in so visitors can only submit requests when physically standing near the entrance gate.",
      side: "left",
      align: "start",
    },
  },
];

export const DEPARTMENTS_TOUR_STEPS: DriveStep[] = [
  {
    element: "#tour-departments-header",
    popover: {
      title: "Units & Occupants Directory",
      description: "Organize your facility into departments, house numbers, or suites and assign hosts or tenants so visitors can easily select who they are visiting.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-departments-add-btn",
    popover: {
      title: "Add Unit or Department",
      description: "Manually create a new department, office suite, or house unit to populate your visitor check-in dropdowns.",
      side: "left",
      align: "center",
    },
  },
  {
    element: "#tour-departments-search",
    popover: {
      title: "Instant Search",
      description: "Instantly filter hundreds of units, tenants, or staff members by name, unit number, phone, or email.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-departments-list",
    popover: {
      title: "Units & Hosts Manager",
      description: "View occupants inside each unit. Records imported via our PMS Directory Sync API will display a 'Synced' badge with their external ID.",
      side: "top",
      align: "start",
    },
  },
];

export const SETTINGS_TOUR_STEPS: DriveStep[] = [
  {
    element: "#tour-settings-header",
    popover: {
      title: "Workspace Settings",
      description: "Configure your administrator profile, estate/office branding, custom terminology, API integrations, and data privacy.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-settings-tabs",
    popover: {
      title: "Settings Navigation",
      description: "Easily jump between Account & Security, Branding, Building Terminology, PMS Directory Sync API Keys, and Data Privacy.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-settings-account",
    popover: {
      title: "Administrator Profile & Password",
      description: "Review your administrator credentials and update your password with strong security criteria.",
      side: "top",
      align: "start",
    },
  },
  {
    element: "#tour-settings-branding",
    popover: {
      title: "Organization Logo & Branding",
      description: "Upload your company or estate logo to brand your public visitor check-in gates, digital visitor passes, and dashboard headers.",
      side: "top",
      align: "start",
    },
  },
  {
    element: "#tour-settings-terminology",
    popover: {
      title: "Multi-Industry Terminology",
      description: "Adapt Karibu VMS to your building type: Corporate Offices (Department & Host), Residential Estates (House/Unit & Tenant), Commercial Suites, or Schools.",
      side: "top",
      align: "start",
    },
  },
  {
    element: "#tour-settings-api",
    popover: {
      title: "Directory Sync REST API & Keys",
      description: "Generate secure Bearer tokens to connect external Property Management Systems to automate unit and tenant sync.",
      side: "top",
      align: "start",
    },
  },
  {
    element: "#tour-settings-privacy",
    popover: {
      title: "Privacy & Data Anonymization",
      description: "Permanently scrub personal details and photos from checked-out visitors to comply with Data Protection regulations while keeping audit logs intact.",
      side: "top",
      align: "start",
    },
  },
];

function createKaribuDriver(steps: DriveStep[], onComplete?: () => void) {
  return driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: "#0f172a",
    overlayOpacity: 0.72,
    stagePadding: 6,
    stageRadius: 14,
    popoverClass: "karibu-tour-popover",
    progressText: "{{current}} of {{total}}",
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Finish Tour 🎉",
    onDestroyed: () => {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // ignore localStorage restriction
      }
      onComplete?.();
    },
    steps,
  });
}

function runStepList(steps: DriveStep[], onComplete?: () => void) {
  if (typeof window === "undefined") return;

  const visibleSteps = steps.filter((step) => {
    if (!step.element) return true;
    if (typeof step.element === "string") {
      return Boolean(document.querySelector(step.element));
    }
    return true;
  });

  if (visibleSteps.length === 0) {
    onComplete?.();
    return;
  }

  const driverObj = createKaribuDriver(visibleSteps, onComplete);
  driverObj.drive();
}

export function useAppTour() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isTourRunning, setIsTourRunning] = useState(false);

  const startPlatformTour = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsTourRunning(true);
    runStepList(PLATFORM_TOUR_STEPS, () => setIsTourRunning(false));
  }, []);

  const startQrTour = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsTourRunning(true);
    runStepList(QR_TOUR_STEPS, () => setIsTourRunning(false));
  }, []);

  const startGuardsTour = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsTourRunning(true);
    runStepList(GUARDS_TOUR_STEPS, () => setIsTourRunning(false));
  }, []);

  const startSecurityTour = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsTourRunning(true);
    runStepList(SECURITY_TOUR_STEPS, () => setIsTourRunning(false));
  }, []);

  const startRulesTour = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsTourRunning(true);
    runStepList(RULES_TOUR_STEPS, () => setIsTourRunning(false));
  }, []);

  const startDepartmentsTour = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsTourRunning(true);
    runStepList(DEPARTMENTS_TOUR_STEPS, () => setIsTourRunning(false));
  }, []);

  const startSettingsTour = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsTourRunning(true);
    runStepList(SETTINGS_TOUR_STEPS, () => setIsTourRunning(false));
  }, []);

  const navigateToPlatformTour = useCallback(() => {
    router.push("/dashboard/company-admin?tour=true");
  }, [router]);

  // Auto-trigger if ?tour=true is in URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (searchParams?.get("tour") === "true") {
      const timer = window.setTimeout(() => {
        startPlatformTour();
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }, 400);

      return () => window.clearTimeout(timer);
    }
  }, [searchParams, startPlatformTour]);

  return {
    startPlatformTour,
    startQrTour,
    startGuardsTour,
    startSecurityTour,
    startRulesTour,
    startDepartmentsTour,
    startSettingsTour,
    navigateToPlatformTour,
    isTourRunning,
  };
}
