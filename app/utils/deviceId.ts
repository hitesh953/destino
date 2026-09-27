/**
 * Device ID
 * A locally persisted, per-install identifier used to key this device's
 * FCM token document under `users/{userId}/devices/{deviceId}`. It is not
 * tied to any Firebase user, so it survives login/logout on the same device
 * and lets a user have one doc per physical device across accounts.
 */

import { load, save } from "@/utils/storage"

const DEVICE_ID_KEY = "notification_device_id"

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function getOrCreateDeviceId(): string {
  const existing = load<string>(DEVICE_ID_KEY)
  if (existing) return existing

  const id = generateId()
  save(DEVICE_ID_KEY, id)
  return id
}
