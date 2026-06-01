export const APP_COPY = {
  guardDashboard: {
    title: "Security Command Center",
    subtitle: "Gate Access Dashboard",
    buttons: {
      approve: "Grant Access",
      verifyOtp: "Input Security Code",
      override: "Force Entry (Override)",
      newVisitor: "Register Walk-in",
      showQr: "Display Kiosk Code",
      signOut: "Sign Out",
      checkOut: "Check Out",
      confirm: "Confirm",
      cancel: "Cancel",
    },
    status: {
      pending: "Awaiting Verification",
      checkedIn: "On Premises",
      override: "Manual Entry Logged",
    },
    stats: {
      totalToday: "Total Today",
      pending: "Awaiting Verification",
      checkedIn: "Inside Building",
    },
    table: {
      title: "Today's Active Visitors",
      searchPlaceholder: "Search visitors...",
      empty: "No active visitors match your search.",
      loading: "Loading secure data...",
    },
  },
  adminDashboard: {
    title: "Workspace Overview",
    subtitle: "Operations, access, and visitor activity at a glance",
    buttons: {
      export: "Export Report",
      inviteAdmin: "Invite Admin",
      managePlan: "Manage Plan",
    },
    status: {
      healthy: "All Systems Operational",
      attention: "Needs Attention",
      locked: "Workspace Locked",
    },
  },
  visitorRegistration: {
    title: "Visitor Registration",
    subtitle: "Please complete your details before entry",
    buttons: {
      submit: "Submit Registration",
      takeSelfie: "Take Selfie",
      retry: "Try Again",
    },
    status: {
      sent: "Registration Sent",
      unavailable: "Check-in Unavailable",
      expired: "QR Code Expired",
      locationRequired: "Check-in Area Verification Needed",
    },
  },
} as const;
