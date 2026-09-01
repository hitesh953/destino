/**
 * Animation Timings - Synchronized with Figma Design Specifications
 * All values in milliseconds
 */

export const ANIMATION_TIMINGS = {
  // SPLASH SCREEN SEQUENCE (2.5s total)
  splash: {
    palmFadeIn: 500,          // 0-500ms: Palm appears
    mandalaGrow: 1300,        // 200-1500ms: Mandala scales up
    palmGlow: 1200,           // 800-2000ms: Glow effect
    taglineSlideUp: 500,      // 1500-2000ms: Text slides up
    fadeOut: 500,             // 2000-2500ms: Fade to black
    total: 2500,              // Total splash duration
  },

  // ONBOARDING SCREENS
  onboarding: {
    cardEntrance: 600,        // Card slides in
    particleFloat: 2000,      // Floating animation loop
    pulseButton: 600,         // Button pulse animation
    slideTransition: 400,     // Between slides
  },

  // HOME DASHBOARD
  home: {
    cardHoverScale: 200,      // Card scales on hover
    ctaBreathing: 2000,       // CTA button pulse (continuous)
    cardEntrance: 600,        // Last reading card slides in
    quickInsightFade: 300,    // Insights badges fade in
    navIndicator: 300,        // Tab indicator moves
  },

  // CAMERA SCREEN
  camera: {
    guidanceCirclePulse: 1500,  // Border pulse on guidance circle
    handDetectedColor: 500,     // Color change when hand detected
    captureButtonShutter: 500,  // Shutter press animation
    captureFlash: 300,          // White flash on capture
    loadingSpinner: 1000,       // Spinner rotation per cycle
  },

  // PROCESSING SCREEN (4s total)
  processing: {
    mandalaRotation: 8000,      // 8 second continuous rotation
    mandalaRing: 2000,          // Middle ring pulse
    scanLineTraverse: 2000,     // Scanning line sweep
    particleOrbit: 1500,        // Particles orbit animation
    textFadeIn: 1200,           // Status text appears
    progressBar: 4000,          // Progress bar fill
    total: 4000,                // Total processing time
  },

  // READING RESULT SCREEN
  reading: {
    headerFade: 800,            // Header background fades in
    titleEntry: 600,            // Title bounces in
    iconZoom: 300,              // Icon scales in
    textRevealPerWord: 50,      // 50ms between words
    textRevealTotal: 1000,      // Total text reveal time
    cardSlideIn: 600,           // Individual card entrance
    cardStagger: 150,           // 150ms between cards
    shareModalSlideUp: 400,     // Modal appears from bottom
    shareModalFade: 300,        // Overlay fade in
  },

  // HISTORY TIMELINE
  history: {
    timelineLineDraw: 1000,     // SVG line draws from top to bottom
    cardEntrance: 500,          // Card fades in
    cardStagger: 100,           // 100ms between cards
    favoriteHeart: 400,         // Heart animation on favorite tap
    deleteSlide: 300,           // Card slides off on delete
  },

  // PROFILE SCREEN
  profile: {
    photoZoom: 600,             // Profile photo scales in
    statsCountUp: 1500,         // Numbers count from 0 to final
    statsStagger: 200,          // 200ms between stat cards
    themeToggle: 500,           // Theme switch animation
  },

  // SETTINGS SCREEN
  settings: {
    toggleSwitch: 400,          // Toggle animation
    dropdownSlide: 300,         // Dropdown appears
    optionFade: 200,            // Options fade in
    optionStagger: 50,          // 50ms between options
  },

  // NAVIGATION TRANSITIONS
  transition: {
    pushLeft: 400,              // Forward navigation (slide left)
    popRight: 400,              // Back navigation (slide right)
    fadeScreen: 300,            // Screen fade transition
    modalSlideUp: 400,          // Modal entrance from bottom
    toastSlideDown: 300,        // Toast slides from top
    tabFade: 300,               // Tab change animation
  },

  // MICRO INTERACTIONS
  micro: {
    rippleEffect: 600,          // Button ripple expands
    tapScale: 150,              // Button tap down/up
    textCursorBlink: 500,       // Text field cursor blink
    loadingDots: 1200,          // Loading dots animation
  },

  // GESTURE REACTIONS
  gesture: {
    swipeRespond: 100,          // Immediate swipe response
    swipeComplete: 400,         // Complete swipe animation
    panDamping: 200,            // Pan gesture damping
    bounceBack: 300,            // Spring back animation
  },
} as const;

/**
 * Easing Functions - Synchronized with Figma Specifications
 * Using cubic-bezier values from design spec
 */
export const EASING = {
  // Primary easing from Figma: cubic-bezier(0.34, 1.56, 0.64, 1)
  // Creates a bouncy, spring-like effect
  bounce: [0.34, 1.56, 0.64, 1] as const,

  // Standard easing
  smooth: [0.25, 0.46, 0.45, 0.94] as const,

  // Linear for continuous rotations
  linear: [1, 1, 1, 1] as const,

  // Ease in for entering elements
  easeIn: [0.42, 0, 1, 1] as const,

  // Ease out for exiting elements
  easeOut: [0, 0, 0.58, 1] as const,

  // Ease in-out for smooth transitions
  easeInOut: [0.42, 0, 0.58, 1] as const,
} as const;

/**
 * Default animation configuration
 */
export const ANIMATION_CONFIG = {
  // Whether to enable animations (can be disabled for accessibility)
  enabled: true,

  // Reduce motion preference support
  reduceMotionEnabled: false,

  // Animation speed multiplier (1 = normal, 0.5 = half speed, 2 = double speed)
  speedMultiplier: 1,

  // FPS target (60fps recommended)
  targetFPS: 60,
} as const;

/**
 * Get reduced timing for accessibility (0% animations = instant)
 */
export const getReducedMotionTiming = (timing: number): number => {
  if (ANIMATION_CONFIG.reduceMotionEnabled) {
    return 0; // Instant
  }
  return timing * ANIMATION_CONFIG.speedMultiplier;
};

/**
 * Animation spring physics configuration
 */
export const SPRING_CONFIG = {
  // Default spring (bouncy, smooth)
  default: {
    damping: 10,
    mass: 1,
    stiffness: 100,
  },

  // Gentle spring (less bounce)
  gentle: {
    damping: 15,
    mass: 1,
    stiffness: 100,
  },

  // Tight spring (quick, minimal overshoot)
  tight: {
    damping: 20,
    mass: 1,
    stiffness: 150,
  },

  // Loose spring (bouncy, playful)
  loose: {
    damping: 5,
    mass: 1,
    stiffness: 50,
  },
} as const;
