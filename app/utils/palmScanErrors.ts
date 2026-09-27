/**
 * Palm Scan Error Messages
 * Maps the palm-scan pipeline's typed error codes to user-friendly copy.
 * Kept in one place so Camera/Processing/ReadingResult stay consistent.
 */

export type PalmScanErrorCode =
  | 'CAMERA_PERMISSION_DENIED'
  | 'NO_HAND'
  | 'MULTIPLE_HANDS'
  | 'POOR_LIGHTING'
  | 'TOO_BLURRY'
  | 'PALM_NOT_FACING_CAMERA'
  | 'PALM_OUT_OF_FRAME'
  | 'IMAGE_PROCESSING_FAILED'
  | 'AI_REQUEST_FAILED'
  | 'AI_RESPONSE_INVALID'
  | 'DATABASE_SAVE_FAILED';

const MESSAGES: Record<PalmScanErrorCode, string> = {
  CAMERA_PERMISSION_DENIED: 'We need camera access to capture your palm.',
  NO_HAND: 'No palm detected. Please place your palm inside the frame.',
  MULTIPLE_HANDS: 'Please show only one palm.',
  POOR_LIGHTING: 'Please move to a brighter area.',
  TOO_BLURRY: 'The image is too blurry. Please hold your hand steady.',
  PALM_NOT_FACING_CAMERA: 'Please face your palm directly toward the camera.',
  PALM_OUT_OF_FRAME: 'Please keep your complete palm inside the frame.',
  IMAGE_PROCESSING_FAILED: "We couldn't process that photo. Please try again.",
  AI_REQUEST_FAILED: "We couldn't analyze your palm right now. Please try again.",
  AI_RESPONSE_INVALID: "We couldn't analyze your palm right now. Please try again.",
  DATABASE_SAVE_FAILED: "We analyzed your palm but couldn't save it. Please try again.",
};

export function getPalmScanErrorMessage(code: string): string {
  return MESSAGES[code as PalmScanErrorCode] || "Something went wrong. Please try again.";
}
