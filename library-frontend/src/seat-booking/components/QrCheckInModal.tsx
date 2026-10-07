import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CampusBreadcrumb } from './CampusBreadcrumb';
import { ReadingRoomsHeader } from './ReadingRoomsHeader';
import { Colors, Shadows } from '../constants/designSystem';

interface QrCheckInModalProps {
  visible: boolean;
  seatNumber?: string;
  roomName?: string;
  timeRange?: string;
  dateLabel?: string;
  passCode?: string;
  token?: string;
  pin?: string;
  onClose: () => void;
}

export const QrCheckInModal: React.FC<QrCheckInModalProps> = ({
  visible,
  seatNumber = 'B-17',
  roomName = 'Individual Study Area',
  timeRange = '02:30 PM – 04:30 PM',
  passCode = '9982',
  token = `KSN-${seatNumber}-9982`,
  pin = '8492',
  onClose,
}) => {
  const [pinCopied, setPinCopied] = useState(false);
  const router = useRouter();

  const handleCopyPin = () => {
    setPinCopied(true);
    Alert.alert('PIN Copied!', `Check-In PIN ${pin} copied to clipboard.`);
    setTimeout(() => setPinCopied(false), 2000);
  };

  const handleTurnstileScan = () => {
    Alert.alert(
      'Turnstile Check-In Verified! ✅',
      `Welcome to ${roomName}! Turnstile Gate #L2-N unlocked for Seat ${seatNumber}.`
    );
  };

  const handleReleaseExtend = () => {
    Alert.alert(
      'Seat Management',
      `Seat ${seatNumber} is active until ${timeRange.split('–')[1] || 'end of slot'}.`,
      [
        {
          text: 'Extend Seat',
          onPress: () => {
            onClose();
            router.push({
              pathname: '/seats/extend-reservation',
              params: { seatNumber, roomName, timeRange },
            });
          },
        },
        {
          text: 'Release Early',
          style: 'destructive',
          onPress: () => {
            onClose();
            router.push({
              pathname: '/seats/early-release',
              params: { seatNumber, roomName, timeRange },
            });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const cleanSeatLabel = seatNumber.startsWith('Seat') ? seatNumber : `Seat ${seatNumber}`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Top Header */}
        <ReadingRoomsHeader
          onNotificationPress={() => Alert.alert('Notifications', 'No new alerts.')}
          onProfilePress={() => Alert.alert('Profile', 'Student Account #2026-IT')}
        />

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Breadcrumb Header */}
          <CampusBreadcrumb
            campusName="VERIFICATION"
            spacesCount="SCREEN 05"
            title="Seat Check–in Pass"
            subtitle="Scan your QR code at the entrance."
            onBackPress={onClose}
          />

          {/* Top Verified Status Card (Name & Faculty Removed as requested) */}
          <View style={styles.verifiedCard}>
            <View style={styles.verifiedLeft}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.verifiedText}>CAMPUS PASS VERIFIED</Text>
            </View>

            <View style={styles.activePill}>
              <Text style={styles.activePillText}>Active</Text>
            </View>
          </View>

          {/* QR Code Container Card */}
          <View style={styles.qrCard}>
            {/* Ready to Scan Pill */}
            <View style={styles.scanPillContainer}>
              <View style={styles.readyPill}>
                <View style={styles.greenDot} />
                <Text style={styles.readyPillText}>Ready to Scan</Text>
              </View>
            </View>

            {/* QR Code Graphic Display */}
            <View style={styles.qrGraphicFrame}>
              {/* Blue Corner Brackets */}
              <View style={[styles.cornerBracket, styles.topLeftBracket]} />
              <View style={[styles.cornerBracket, styles.topRightBracket]} />
              <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
              <View style={[styles.cornerBracket, styles.bottomRightBracket]} />

              {/* QR Pattern Representation */}
              <View style={styles.qrGridContainer}>
                {/* 3 Large Corner Position Markers */}
                <View style={[styles.qrMarker, { top: 12, left: 12 }]} />
                <View style={[styles.qrMarker, { top: 12, right: 12 }]} />
                <View style={[styles.qrMarker, { bottom: 12, left: 12 }]} />

                {/* Simulated QR Code Data Blocks */}
                <View style={styles.qrDataBlockRow}>
                  <View style={[styles.qrPixel, { width: 14, height: 14 }]} />
                  <View style={[styles.qrPixel, { width: 8, height: 8 }]} />
                  <View style={[styles.qrPixel, { width: 18, height: 10 }]} />
                </View>
                <View style={styles.qrDataBlockRow}>
                  <View style={[styles.qrPixel, { width: 22, height: 12 }]} />
                  <View style={[styles.qrPixel, { width: 12, height: 14 }]} />
                  <View style={[styles.qrPixel, { width: 10, height: 10 }]} />
                </View>
                <View style={styles.qrDataBlockRow}>
                  <View style={[styles.qrPixel, { width: 10, height: 14 }]} />
                  <View style={[styles.qrPixel, { width: 20, height: 8 }]} />
                  <View style={[styles.qrPixel, { width: 14, height: 14 }]} />
                </View>

                {/* Horizontal Laser Scanning Line */}
                <View style={styles.qrLaserLine} />
              </View>
            </View>

            {/* Token Label */}
            <Text style={styles.tokenText}>
              TOKEN: <Text style={styles.tokenBoldText}>{token}</Text>
            </Text>

            {/* Divider */}
            <View style={styles.orDividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.orDividerText}>OR ENTER PIN</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 4 PIN Digit Boxes */}
            <View style={styles.pinBoxesRow}>
              {pin.split('').slice(0, 4).map((digit, idx) => (
                <View key={idx} style={styles.pinBox}>
                  <Text style={styles.pinDigitText}>{digit}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.copyPinBox}
                onPress={handleCopyPin}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={pinCopied ? 'checkmark' : 'copy-outline'}
                  size={16}
                  color={pinCopied ? Colors.success : Colors.textDark}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Allocated Station Card */}
          <View style={styles.allocatedCard}>
            <View style={styles.allocatedTopRow}>
              <View>
                <Text style={styles.allocatedLabel}>ALLOCATED STATION</Text>
                <Text style={styles.stationTitle}>{cleanSeatLabel}</Text>
                <Text style={styles.stationSubtitle}>{roomName} (Level 1)</Text>
              </View>

              <View style={styles.slotGroup}>
                <Text style={styles.allocatedLabel}>SLOT WINDOW</Text>
                <Text style={styles.slotTimeText}>{timeRange}</Text>
                <View style={styles.hoursBadge}>
                  <Text style={styles.hoursBadgeText}>2.0 Hours</Text>
                </View>
              </View>
            </View>

            <View style={styles.graceDivider} />

            <View style={styles.graceRow}>
              <View style={styles.graceLeft}>
                <Ionicons name="hourglass-outline" size={14} color={Colors.warning} />
                <Text style={styles.graceLabel}>Check-in grace period:</Text>
              </View>
              <Text style={styles.graceTimerText}>11:38</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleTurnstileScan}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.textDark} />
              <Text style={styles.scanButtonText}>Scan at Turnstile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.releaseButton}
              onPress={handleReleaseExtend}
              activeOpacity={0.8}
            >
              <Ionicons name="headset-outline" size={18} color="#FFFFFF" />
              <Text style={styles.releaseButtonText}>Seat Releases and extends</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  verifiedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: 0.6,
  },
  activePill: {
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  qrCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.card,
  },
  scanPillContainer: {
    marginBottom: 16,
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  readyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  qrGraphicFrame: {
    width: 210,
    height: 210,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFBFB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  cornerBracket: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Colors.primary,
  },
  topLeftBracket: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  topRightBracket: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  bottomLeftBracket: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  bottomRightBracket: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  qrGridContainer: {
    width: 170,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  qrMarker: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderWidth: 7,
    borderColor: '#1C283B',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  qrDataBlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  qrPixel: {
    backgroundColor: '#1C283B',
    borderRadius: 2,
  },
  qrLaserLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: Colors.primary,
    ...Shadows.soft,
  },
  tokenText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  tokenBoldText: {
    color: Colors.textDark,
    fontWeight: '800',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5EBF0',
  },
  orDividerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  pinBoxesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pinBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigitText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  copyPinBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allocatedCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  allocatedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  allocatedLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  stationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  stationSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  slotGroup: {
    alignItems: 'flex-end',
  },
  slotTimeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  hoursBadge: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  hoursBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  graceDivider: {
    height: 1,
    backgroundColor: '#F0F3F6',
    marginVertical: 10,
  },
  graceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  graceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  graceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  graceTimerText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 10,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: 14,
    ...Shadows.soft,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  releaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    ...Shadows.soft,
  },
  releaseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
