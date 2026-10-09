import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, radius, spacing, font, shadows } from './theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  variant?: 'light' | 'dashboard';
}

export const Header = ({ title, subtitle, onBack, right, variant = 'light' }: HeaderProps) => {
  const isDashboard = variant === 'dashboard';

  return (
    <View style={[s.header, isDashboard && s.headerDashboard]}>
      <View style={s.headerContent}>
        <View style={s.headerLeft}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={s.backBtn}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={24} color={isDashboard ? '#FFFFFF' : colors.primary} />
            </TouchableOpacity>
          ) : null}
          <View style={s.headerTitleContainer}>
            <Text style={[s.headerTitle, isDashboard && s.headerTitleDashboard]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[s.headerSubtitle, isDashboard && s.headerSubtitleDashboard]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {right ? <View style={s.headerRight}>{right}</View> : null}
      </View>
    </View>
  );
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap | React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  size = 'md',
}: ButtonProps) => {
  const isOutline = variant === 'outline' || variant === 'secondary';
  const isGhost = variant === 'ghost';

  const getBgColor = () => {
    if (isOutline || isGhost) return 'transparent';
    if (variant === 'success') return colors.success;
    if (variant === 'danger') return colors.error;
    return colors.primary;
  };

  const getTextColor = () => {
    if (isGhost) return colors.primary;
    if (isOutline) return colors.primary;
    return '#FFFFFF';
  };

  const getBorder = () => {
    if (isOutline) return { borderWidth: 1.5, borderColor: colors.primary };
    return {};
  };

  const getHeight = () => {
    if (size === 'sm') return 36;
    if (size === 'lg') return 52;
    return 48;
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return (
        <Ionicons
          name={icon as any}
          size={size === 'sm' ? 16 : 18}
          color={getTextColor()}
          style={iconPosition === 'left' ? { marginRight: 6 } : { marginLeft: 6 }}
        />
      );
    }
    return icon;
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      style={[
        s.btn,
        {
          backgroundColor: getBgColor(),
          height: getHeight(),
          opacity: disabled ? 0.5 : 1,
        },
        getBorder(),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={s.btnContent}>
          {iconPosition === 'left' ? renderIcon() : null}
          <Text style={[s.btnText, { color: getTextColor(), fontSize: size === 'sm' ? font.small : font.body }, textStyle]}>
            {title}
          </Text>
          {iconPosition === 'right' ? renderIcon() : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  activeOpacity?: number;
}

export const Card = ({ children, style, onPress, activeOpacity = 0.75 }: CardProps) => {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={[s.card, shadows.sm, style]}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[s.card, shadows.sm, style]}>{children}</View>;
};

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View
        style={[
          s.inputWrapper,
          focused && s.inputFocused,
          !!error && s.inputError,
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={20}
            color={focused ? colors.primary : colors.textSecondary}
            style={{ marginRight: 10 }}
          />
        ) : null}
        <TextInput
          placeholderTextColor={colors.textSecondary}
          style={[s.input, style]}
          onFocus={(e) => {
            setFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...props}
        />
        {rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress} activeOpacity={0.7}>
            <Ionicons name={rightIcon} size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={s.errorText}>{error}</Text> : null}
    </View>
  );
};

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onClear?: () => void;
}) => (
  <View style={s.searchWrapper}>
    <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      style={s.searchInput}
      autoCorrect={false}
    />
    {value.length > 0 ? (
      <TouchableOpacity
        onPress={() => {
          onChangeText('');
          if (onClear) onClear();
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    ) : null}
  </View>
);

const BADGE_CONFIG: Record<string, { bg: string; text: string; dot: string; label?: string }> = {
  Pending: { bg: colors.warningLight, text: colors.warning, dot: colors.warning },
  Confirmed: { bg: colors.successLight, text: colors.success, dot: colors.success },
  Cancelled: { bg: colors.errorLight, text: colors.error, dot: colors.error },
  Completed: { bg: colors.primaryLight, text: colors.primary, dot: colors.primary },
  Available: { bg: colors.successLight, text: colors.success, dot: colors.success },
  Occupied: { bg: colors.errorLight, text: colors.error, dot: colors.error },
  Reserved: { bg: colors.warningLight, text: colors.warning, dot: colors.warning },
  Maintenance: { bg: colors.secondaryLight, text: colors.textSecondary, dot: colors.textSecondary },
  Active: { bg: colors.successLight, text: colors.success, dot: colors.success },
  Inactive: { bg: colors.errorLight, text: colors.error, dot: colors.error },
  Student: { bg: colors.primaryLight, text: colors.primary, dot: colors.primary },
  Staff: { bg: colors.warningLight, text: colors.warning, dot: colors.warning },
  Admin: { bg: colors.successLight, text: colors.success, dot: colors.success },
};

export const StatusBadge = ({ status }: { status?: string }) => {
  const key = String(status || 'Unknown');
  const cfg = BADGE_CONFIG[key] || {
    bg: colors.secondaryLight,
    text: colors.textSecondary,
    dot: colors.textSecondary,
  };

  return (
    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
      <View style={[s.badgeDot, { backgroundColor: cfg.dot }]} />
      <Text style={[s.badgeText, { color: cfg.text }]}>{key}</Text>
    </View>
  );
};

interface ChipProps {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const Chip = ({ label, active, onPress, icon }: ChipProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    style={[
      s.chip,
      active ? s.chipActive : s.chipInactive,
    ]}
  >
    {icon ? (
      <Ionicons
        name={icon}
        size={14}
        color={active ? colors.primary : colors.textSecondary}
        style={{ marginRight: 6 }}
      />
    ) : null}
    <Text style={[s.chipText, active ? s.chipTextActive : s.chipTextInactive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => {
  const initials = (name || 'U')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(45, 124, 233, 0.2)',
      }}
    >
      <Text style={{ color: colors.primary, fontWeight: '700', fontSize: size * 0.4 }}>
        {initials}
      </Text>
    </View>
  );
};

export const IconCircle = ({
  icon,
  color = colors.primary,
  bg,
  size = 40,
}: {
  icon: keyof typeof Ionicons.glyphMap | keyof typeof Feather.glyphMap;
  color?: string;
  bg?: string;
  size?: number;
}) => {
  const background = bg || `${color}18`;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon as any} size={size * 0.5} color={color} />
    </View>
  );
};

export const SectionTitle = ({
  title,
  subtitle,
  right,
  style,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
}) => (
  <View style={[s.sectionHeader, style]}>
    <View style={{ flex: 1 }}>
      <Text style={s.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={s.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
    {right ? <View>{right}</View> : null}
  </View>
);

export const Fab = ({
  onPress,
  icon = 'add',
  label,
}: {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={label || 'Add item'}
    style={[s.fab, shadows.md]}
  >
    <Ionicons name={icon} size={24} color="#FFFFFF" />
    {label ? <Text style={s.fabLabel}>{label}</Text> : null}
  </TouchableOpacity>
);

export const Loading = ({ message }: { message?: string }) => (
  <View style={s.centerBox}>
    <ActivityIndicator size="large" color={colors.primary} />
    {message ? <Text style={s.loadingText}>{message}</Text> : null}
  </View>
);

export const ErrorBox = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <View style={s.centerBox}>
    <View style={s.errorIconContainer}>
      <Ionicons name="alert-circle-outline" size={32} color={colors.error} />
    </View>
    <Text style={s.errorTitle}>Something went wrong</Text>
    <Text style={s.errorMessage}>{message}</Text>
    {onRetry ? (
      <Button
        title="Try Again"
        variant="outline"
        size="sm"
        icon="refresh"
        onPress={onRetry}
        style={{ marginTop: spacing.md, minWidth: 120 }}
      />
    ) : null}
  </View>
);

export const Empty = ({
  text = 'Nothing here yet',
  icon = 'folder-open-outline',
  actionLabel,
  onAction,
}: {
  text?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View style={s.centerBox}>
    <View style={s.emptyIconContainer}>
      <Ionicons name={icon} size={36} color={colors.textSecondary} />
    </View>
    <Text style={s.emptyText}>{text}</Text>
    {actionLabel && onAction ? (
      <Button
        title={actionLabel}
        variant="outline"
        size="sm"
        onPress={onAction}
        style={{ marginTop: spacing.md }}
      />
    ) : null}
  </View>
);

const s = StyleSheet.create({
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  headerDashboard: {
    backgroundColor: colors.primary,
    borderBottomWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: 'rgba(45, 124, 233, 0.08)',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: font.h2,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  headerTitleDashboard: {
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: font.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerSubtitleDashboard: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  btn: {
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
  },
  label: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: font.body,
    paddingVertical: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: font.small,
    marginTop: 4,
    marginLeft: 2,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: font.body,
    paddingVertical: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: font.small,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: font.small,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  chipTextInactive: {
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm + 2,
  },
  sectionTitle: {
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: font.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 52,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 99,
  },
  fabLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: font.body,
    marginLeft: 6,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: font.body,
    marginTop: spacing.sm,
  },
  errorIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  errorTitle: {
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  errorMessage: {
    color: colors.textSecondary,
    fontSize: font.body,
    textAlign: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: font.body,
    fontWeight: '500',
    textAlign: 'center',
  },
});
