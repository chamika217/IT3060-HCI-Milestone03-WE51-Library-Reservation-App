/**
 * dialog.tsx – Cross-platform dialog helpers for web + native.
 *
 * On react-native-web Alert.alert is a silent no-op, so we branch on Platform.OS:
 *   - web  → window.alert / window.confirm / in-app <Modal> bottom sheet
 *   - native → Alert.alert (existing behaviour)
 *
 * Export surface:
 *   notify(title, message?)                               → void
 *   confirmAction(title, message, confirmText?, destructive?) → Promise<boolean>
 *   chooseAction(title, message, options[])               → Promise<string | null>
 *   ActionSheet                                           → React component – mount once at the root
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Alert,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, spacing, font, radius, shadows } from './theme';

// ─── Internal web action-sheet state ────────────────────────────────────────

type SheetOption = { label: string; value: string };

type SheetRequest = {
  title: string;
  message: string;
  options: SheetOption[];
  resolve: (value: string | null) => void;
};

// Singleton callback set by <ActionSheet /> when it mounts.
let _showSheet: ((req: SheetRequest) => void) | null = null;

// ─── Public helpers ──────────────────────────────────────────────────────────

/** Show a non-blocking message to the user. */
export function notify(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

/**
 * Ask the user to confirm a destructive or important action.
 * Resolves to true (confirmed) or false (cancelled).
 */
export function confirmAction(
  title: string,
  message: string,
  confirmText = 'Confirm',
  destructive = false
): Promise<boolean> {
  if (Platform.OS === 'web') {
    const ok = window.confirm(`${title}\n\n${message}`);
    return Promise.resolve(ok);
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}

/**
 * Present a list of labelled actions for the user to pick from.
 * Returns the chosen option's `value`, or null if cancelled.
 *
 * On native: uses Alert.alert (one button per option + Cancel).
 * On web: uses the in-app <ActionSheet /> modal (must be rendered in the tree).
 */
export function chooseAction(
  title: string,
  message: string,
  options: SheetOption[]
): Promise<string | null> {
  if (Platform.OS !== 'web') {
    return new Promise((resolve) => {
      const buttons = options.map((opt) => ({
        text: opt.label,
        onPress: () => resolve(opt.value),
      }));
      buttons.push({ text: 'Cancel', onPress: () => resolve(null) } as any);
      Alert.alert(title, message, buttons);
    });
  }

  // Web path – delegate to the mounted <ActionSheet />
  if (!_showSheet) {
    // Fallback if ActionSheet is not mounted – shouldn't happen in normal use
    console.warn('dialog: ActionSheet is not mounted. Mount <ActionSheet /> near the root.');
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    _showSheet!({ title, message, options, resolve });
  });
}

// ─── <ActionSheet /> – web-only bottom-sheet modal ──────────────────────────

/**
 * Mount this component once inside AdminApp (or another root component).
 * It is a no-op on native.
 */
export function ActionSheet() {
  const [visible, setVisible] = useState(false);
  const [request, setRequest] = useState<SheetRequest | null>(null);
  const resolveRef = useRef<((v: string | null) => void) | null>(null);

  // Register the show callback so chooseAction() can trigger us
  _showSheet = useCallback((req: SheetRequest) => {
    resolveRef.current = req.resolve;
    setRequest(req);
    setVisible(true);
  }, []);

  const pick = (value: string) => {
    setVisible(false);
    resolveRef.current?.(value);
  };

  const cancel = () => {
    setVisible(false);
    resolveRef.current?.(null);
  };

  if (Platform.OS !== 'web') return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cancel}
    >
      <TouchableOpacity style={sheet.backdrop} activeOpacity={1} onPress={cancel}>
        <View style={sheet.container}>
          {request && (
            <>
              <View style={sheet.handle} />
              <Text style={sheet.title}>{request.title}</Text>
              {!!request.message && (
                <Text style={sheet.message}>{request.message}</Text>
              )}
              <View style={sheet.divider} />
              <ScrollView bounces={false} style={{ maxHeight: 320 }}>
                {request.options.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={sheet.optionBtn}
                    onPress={() => pick(opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={sheet.optionText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={sheet.divider} />
              <TouchableOpacity style={sheet.cancelBtn} onPress={cancel} activeOpacity={0.7}>
                <Text style={sheet.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const sheet = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 40, 59, 0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: 32,
    paddingHorizontal: spacing.md,
    ...shadows.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 12,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  message: {
    fontSize: font.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  optionBtn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginVertical: 2,
  },
  optionText: {
    fontSize: font.body,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: spacing.xs,
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.secondaryLight,
  },
  cancelText: {
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
