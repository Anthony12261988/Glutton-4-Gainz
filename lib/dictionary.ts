/**
 * TACTICAL UI DICTIONARY
 *
 * Centralized military-themed terminology for Glutton4Gainz (G4G)
 * Eliminates developer jargon and maintains operational voice throughout the application.
 *
 * VOICE & TONE: Tactical, Disciplined, High-Stakes
 * All user-facing text must feel like a military interface, not a web app.
 */

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

export const TOAST_MESSAGES = {
  // Authentication & Authorization
  auth: {
    loginFailed: {
      title: "ACCESS DENIED",
      description: "Authentication failed. Verify credentials and retry."
    },
    loginSuccess: {
      title: "ACCESS GRANTED",
      description: "Identity confirmed. Welcome back, soldier."
    },
    loginError: {
      title: "SYSTEM ERROR",
      description: "Authentication system offline. Retry in 60 seconds."
    },
    passwordMismatch: {
      title: "SECURITY PROTOCOL VIOLATION",
      description: "Clearance codes do not match. Re-enter and confirm."
    },
    weakPassword: {
      title: "CLEARANCE CODE INSUFFICIENT",
      description: "Security requires minimum 8 characters."
    },
    registrationFailed: {
      title: "ENLISTMENT REJECTED",
      description: "Unable to process registration. Contact command."
    },
    registrationSuccess: {
      title: "ENLISTMENT COMPLETE",
      description: "Soldier added to roster. Proceed to Day Zero assessment."
    },
    verificationEmailSent: {
      title: "VERIFY YOUR COMMS",
      description: "Confirmation signal dispatched. Check your inbox and confirm identity."
    },
    registrationError: {
      title: "ENLISTMENT SYSTEM ERROR",
      description: "Registration system offline. Retry shortly."
    },
    passwordUpdated: {
      title: "CLEARANCE CODE UPDATED",
      description: "Security credentials confirmed. Access restored."
    },
    resetFailed: {
      title: "RESET OPERATION FAILED",
      description: "Unable to reset credentials. Verify identity and retry."
    },
    resetLinkSent: {
      title: "RESET PROTOCOL INITIATED",
      description: "Recovery link dispatched to your comms. Follow instructions to proceed."
    },
    resetRequestFailed: {
      title: "RESET REQUEST DENIED",
      description: "Unable to process reset. Verify email and retry."
    },
    userAlreadyExists: {
      title: "DUPLICATE RECORD",
      description: "This soldier is already in the system."
    },
    inviteAlreadyAccepted: {
      title: "COMMISSION ACTIVE",
      description: "This officer has already accepted their assignment."
    }
  },

  // Workout & Fitness Operations
  workout: {
    missionComplete: {
      title: "MISSION ACCOMPLISHED",
      description: "Workout logged. Experience and streak updated."
    },
    missionFailed: {
      title: "LOG TRANSMISSION FAILED",
      description: "Unable to record mission data. Retry submission."
    },
    onboardingComplete: {
      title: "COMMISSION ACCEPTED",
      description: "Day Zero complete. Routing to Command Dashboard."
    },
    assessmentError: {
      title: "ASSESSMENT FAILED",
      description: "Day Zero results could not be saved. Please retry."
    },
    profileUpdated: {
      title: "PROFILE SYNCHRONIZED",
      description: "Soldier data updated. Routing to dashboard..."
    },
    workoutCreated: {
      title: "MISSION BRIEFING CREATED",
      description: "Workout mission deployed to roster."
    },
    workoutUpdated: {
      title: "MISSION BRIEFING UPDATED",
      description: "Workout parameters synchronized."
    },
    workoutError: {
      title: "MISSION DEPLOYMENT FAILED",
      description: "Unable to save workout. Verify data and retry."
    }
  },

  // Stats & Metrics
  stats: {
    weightLogged: {
      title: "BIOMETRICS RECORDED",
      description: "Body metrics synchronized for current date."
    },
    metricsFailed: {
      title: "SENSOR MALFUNCTION",
      description: "Unable to log metrics. Retry data submission."
    }
  },

  // Rations (Meal Plans)
  rations: {
    rationAssigned: {
      title: "RATIONS ALLOCATED",
      description: (date: string) => `Nutrition protocol updated for ${date}.`
    },
    rationFailed: {
      title: "ALLOCATION FAILED",
      description: "Unable to update meal plan. Retry operation."
    },
    recipeCreated: {
      title: "RATION FORMULA CREATED",
      description: "Recipe added to nutrition database."
    },
    recipeUpdated: {
      title: "RATION FORMULA UPDATED",
      description: "Recipe parameters synchronized."
    },
    recipeError: {
      title: "FORMULA SYNC FAILED",
      description: "Unable to save recipe. Verify data and retry."
    }
  },

  // Buddy System & Social
  buddy: {
    wakeUpSent: {
      title: "ALERT TRANSMITTED",
      description: (name: string) => `Wake-up call delivered to ${name}. Awaiting response.`
    },
    wakeUpFailed: {
      title: "TRANSMISSION FAILED",
      description: "Unable to deliver wake-up call. Signal interrupted."
    },
    userNotFound: {
      title: "SOLDIER NOT FOUND",
      description: "No active personnel located with that identifier."
    },
    searchFailed: {
      title: "ROSTER SEARCH FAILED",
      description: "Unable to query personnel database. Retry search."
    },
    requestSent: {
      title: "BUDDY REQUEST DEPLOYED",
      description: "Partnership request transmitted. Awaiting confirmation."
    },
    requestFailed: {
      title: "REQUEST FAILED",
      description: "Unable to send buddy request. Retry transmission."
    },
    buddyConfirmed: {
      title: "PARTNERSHIP CONFIRMED",
      description: "Buddy added to your tactical network."
    },
    buddyActionFailed: {
      title: "SYNC FAILED",
      description: "Unable to process buddy action. Retry operation."
    },
    buddyRecentlyActive: {
      title: "SOLDIER ACTIVE",
      description: "Target was active within last 24 hours. Stand down."
    },
    nudgeSent: {
      title: "NUDGE TRANSMITTED",
      description: "Motivation alert delivered to teammate."
    }
  },

  // Command Center (Admin/Coach)
  command: {
    inviteSent: {
      title: "COMMISSION DISPATCHED",
      description: (email: string) => `Officer invitation transmitted to ${email}.`
    },
    inviteFailed: {
      title: "DISPATCH FAILED",
      description: "Unable to transmit commission. Verify address and retry."
    },
    actionFailed: {
      title: "COMMAND FAILED",
      description: "Unable to execute administrative action. Retry."
    }
  },

  // Assets & File Operations
  assets: {
    uploadSuccess: {
      title: "ASSET UPLOADED",
      description: "File transmitted and stored in armory."
    },
    uploadError: {
      title: "UPLOAD FAILED",
      description: "Asset transmission failed. Verify file and retry."
    },
    urlCopied: {
      title: "COORDINATES COPIED",
      description: "Asset URL acquired to clipboard."
    }
  },

  // Push Notifications
  notifications: {
    enabled: {
      title: "ALERT SYSTEM ACTIVE",
      description: "You will receive tactical alerts for missions, badges, and comms."
    },
    enabledFailed: {
      title: "ALERT SYSTEM OFFLINE",
      description: "Unable to initialize notifications. Retry activation."
    },
    disabled: {
      title: "ALERT SYSTEM DISABLED",
      description: "Push notifications deactivated. Re-enable in settings."
    },
    unsupported: {
      title: "SYSTEM INCOMPATIBLE",
      description: "Push alerts not supported on this device."
    },
    blocked: {
      title: "ALERTS BLOCKED",
      description: "Enable notifications in browser settings to receive alerts."
    }
  },

  // Pricing & Stripe
  pricing: {
    checkoutError: {
      title: "PAYMENT PORTAL ERROR",
      description: "Unable to access subscription command. Retry."
    },
    portalError: {
      title: "PORTAL INACCESSIBLE",
      description: "Could not open subscription management. Try again."
    }
  },

  // Generic System Messages
  system: {
    error: {
      title: "SYSTEM ERROR",
      description: "An unexpected error occurred. Retry or contact HQ."
    },
    success: {
      title: "OPERATION COMPLETE",
      description: "Action executed successfully."
    },
    processing: {
      title: "PROCESSING",
      description: "Request in progress. Stand by..."
    }
  }
} as const;

// ============================================================================
// LOADING STATES
// ============================================================================

export const LOADING_TEXT = {
  // Authentication
  authenticating: "AUTHENTICATING...",
  enlisting: "ENLISTING...",
  updating: "UPDATING CLEARANCE...",
  sending: "TRANSMITTING...",

  // Operations
  saving: "SAVING TO DATABASE...",
  processing: "PROCESSING...",
  loading: "ESTABLISHING UPLINK...",
  uploading: "UPLOADING ASSET...",
  logging: "LOGGING MISSION...",
  enabling: "ACTIVATING...",

  // Specific contexts
  decrypting: "DECRYPTING INTEL...",
  synchronizing: "SYNCHRONIZING...",
  deploying: "DEPLOYING...",
  executing: "EXECUTING..."
} as const;

// ============================================================================
// BUTTON LABELS
// ============================================================================

export const BUTTON_LABELS = {
  // Primary Actions
  login: "IDENTIFY",
  signup: "ENLIST",
  submit: "EXECUTE",
  save: "CONFIRM",
  create: "DEPLOY",
  update: "SYNCHRONIZE",
  delete: "TERMINATE",
  cancel: "ABORT",
  confirm: "CONFIRM ORDERS",
  complete: "MISSION COMPLETE",

  // Authentication
  continueWithGoogle: "AUTHENTICATE VIA GOOGLE",
  forgotPassword: "RECOVER ACCESS",
  resetPassword: "RESET CLEARANCE CODE",

  // Social & Buddy System
  wakeUp: "SEND ALERT",
  wakeUpSent: "ALERT SENT",
  addBuddy: "REQUEST PARTNERSHIP",
  acceptBuddy: "CONFIRM BUDDY",

  // Workouts & Missions
  completeMission: "COMPLETE MISSION",
  saveMission: "DEPLOY MISSION",
  addExercise: "ADD EXERCISE",

  // Coach & Admin
  commissionOfficer: "COMMISSION OFFICER",
  saveRecipe: "DEPLOY RATION FORMULA",

  // Notifications
  enableNotifications: "ACTIVATE ALERTS",
  disableNotifications: "DEACTIVATE ALERTS",
  maybeLater: "STAND DOWN",

  // Navigation
  goToOnboarding: "PROCEED TO DAY ZERO",
  goToDashboard: "RETURN TO COMMAND",

  // Assets
  uploadAsset: "UPLOAD TO ARMORY",
  copyUrl: "COPY COORDINATES"
} as const;

// ============================================================================
// EMPTY STATES
// ============================================================================

export const EMPTY_STATES = {
  noMission: {
    title: "NO MISSION SCHEDULED",
    description: "Rest day or awaiting orders from command."
  },
  noRations: {
    title: "NO RATIONS ALLOCATED",
    description: "Meal plan pending. Await nutrition orders."
  },
  noBuddies: {
    title: "NO BATTLE BUDDIES",
    description: "Your tactical network is empty. Deploy buddy requests."
  },
  noRoster: {
    title: "ROSTER EMPTY",
    description: "No soldiers assigned to this unit."
  },
  noIntel: {
    title: "NO INTEL AVAILABLE",
    description: "Data not found. Check back later."
  },
  noAssets: {
    title: "ARMORY EMPTY",
    description: "No assets uploaded. Upload files to populate."
  },
  noRecipes: {
    title: "NO RATION FORMULAS",
    description: "Nutrition database empty. Create recipes."
  },
  noWorkouts: {
    title: "NO MISSIONS AVAILABLE",
    description: "Training schedule empty. Create workout missions."
  },
  sectorClear: {
    title: "SECTOR CLEAR",
    description: "No data detected in this zone."
  }
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  profileLoadingError: {
    title: "PROFILE SYNC FAILED",
    description: "Unable to retrieve soldier profile. Refresh or contact HQ if issue persists."
  },
  criticalSystemError: {
    title: "CRITICAL SYSTEM FAILURE",
    description: "Fatal error detected. System reboot required."
  },
  pageNotFound: {
    title: "SECTOR NOT FOUND",
    description: "Requested coordinates do not exist. Return to base."
  },
  unauthorized: {
    title: "ACCESS DENIED",
    description: "Insufficient clearance. Verify credentials."
  },
  serverError: {
    title: "SERVER OFFLINE",
    description: "Command server unreachable. Retry in 60 seconds."
  },
  networkError: {
    title: "SIGNAL LOST",
    description: "Network connection interrupted. Verify uplink."
  },
  validationError: {
    title: "DATA VALIDATION FAILED",
    description: "Submitted data does not meet protocol requirements."
  }
} as const;

// ============================================================================
// PLACEHOLDER TEXT
// ============================================================================

export const PLACEHOLDERS = {
  // Authentication
  email: "soldier@battalion.com",
  password: "••••••••",
  confirmPassword: "••••••••",

  // Search & Filters
  searchEmail: "Enter soldier identifier...",
  searchRoster: "Search roster by name or ID...",
  filterTroops: "Filter by email, rank, or tier...",

  // Forms
  weight: "Enter weight (lbs)",
  duration: "Mission duration (min)",
  notes: "After-action report: effort, obstacles, intel...",
  message: "Transmit tactical message...",
  briefing: "Enter operational briefing for the day...",

  // Workouts
  exerciseName: "e.g., Push-ups",
  setsReps: "e.g., 3x20",
  videoUrl: "https://youtube.com/watch?v=...",

  // Admin
  officerEmail: "officer@command.com",

  // Generic
  selectTier: "Select Tier",
  enterValue: "0"
} as const;

// ============================================================================
// FORM LABELS
// ============================================================================

export const FORM_LABELS = {
  // Authentication
  email: "Soldier ID (Email)",
  password: "Clearance Code",
  confirmPassword: "Confirm Clearance Code",

  // Profile
  name: "Designation",
  age: "Age",
  weight: "Body Mass (lbs)",
  height: "Height",

  // Workouts
  missionTitle: "Mission Designation",
  tier: "Operational Tier",
  briefing: "Briefing / Operational Details",
  scheduledDate: "Deployment Date",
  videoUrl: "Training Video (YouTube)",
  exercises: "Exercise Protocol",
  duration: "Mission Duration",

  // Rations
  mealType: "Ration Type",
  calories: "Caloric Intake",
  protein: "Protein (g)",
  carbs: "Carbohydrates (g)",
  fats: "Fats (g)",

  // Notes
  notes: "After-Action Report",
  feedback: "Soldier Feedback"
} as const;

// ============================================================================
// PAGE HEADINGS & TITLES
// ============================================================================

export const PAGE_TITLES = {
  // Authentication
  login: {
    title: "IDENTIFY",
    subtitle: "Tactical Fitness Command System",
    description: "Enter credentials to access your operational dashboard."
  },
  signup: {
    title: "ENLIST",
    subtitle: "Join the Unit",
    description: "Create account and complete Day Zero assessment."
  },
  forgotPassword: {
    title: "RECOVER ACCESS",
    subtitle: "Reset Clearance Code",
    description: "Enter your soldier ID to receive recovery instructions."
  },
  resetPassword: {
    title: "UPDATE CLEARANCE",
    subtitle: "Set New Credentials",
    description: "Establish new security credentials to regain access."
  },

  // Dashboard
  dashboard: {
    title: "COMMAND DASHBOARD",
    subtitle: "Mission Control",
    description: "Tactical overview and daily operations."
  },

  // Other Pages
  stats: "PERFORMANCE METRICS",
  rations: "NUTRITION PROTOCOL",
  barracks: "BATTALION BARRACKS",
  buddies: "TACTICAL NETWORK",
  command: "COMMAND CENTER"
} as const;

// ============================================================================
// NAVIGATION LINKS
// ============================================================================

export const NAV_LINKS = {
  newRecruit: "New recruit?",
  alreadyEnlisted: "Already enlisted?",
  signUpLink: "Begin enlistment",
  loginLink: "Access your account"
} as const;

// ============================================================================
// STATUS INDICATORS
// ============================================================================

export const STATUS = {
  online: "OPERATIONAL",
  offline: "OFFLINE",
  active: "ACTIVE",
  inactive: "INACTIVE",
  pending: "PENDING",
  completed: "COMPLETED",
  failed: "FAILED",
  inProgress: "IN PROGRESS"
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a toast message with optional dynamic values
 */
export function getToastMessage(
  category: keyof typeof TOAST_MESSAGES,
  key: string,
  dynamicValue?: string
): { title: string; description: string } {
  const message = (TOAST_MESSAGES as any)[category][key];

  if (typeof message.description === 'function' && dynamicValue) {
    return {
      title: message.title,
      description: message.description(dynamicValue)
    };
  }

  return message;
}

/**
 * Get an error code display string
 */
export function formatErrorCode(digest?: string): string {
  return digest ? `INCIDENT CODE: ${digest.toUpperCase()}` : "INCIDENT CODE: UNKNOWN";
}

/**
 * Format a date for tactical display
 */
export function formatTacticalDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).toUpperCase();
}
