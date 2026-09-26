/**
 * NotificationPermissionModal
 * Shown once (not immediately on app start) to explain why the app wants
 * permission to send notifications, before the Android system permission
 * dialog is triggered.
 */

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

interface NotificationPermissionModalProps {
  visible: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  visible,
  onEnable,
  onDismiss,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.title}>Stay Updated</Text>
          <Text style={styles.body}>
            Get your daily Rashifal and personalized insights directly on your phone.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={onEnable}
          >
            <Text style={styles.primaryButtonText}>Enable Notifications</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={onDismiss}
          >
            <Text style={styles.secondaryButtonText}>Maybe Later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFDFC',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#5B5B7A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#7B68EE',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B4FA0',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
