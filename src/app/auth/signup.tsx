import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSignUp = async () => {
    if (passwordMismatch) return;
    setLoading(true);
    // TODO: Supabase auth
    setTimeout(() => {
      setLoading(false);
      router.replace('/splash/slide1');
    }, 1200);
  };

  const isValid = email && password && confirmPassword && !passwordMismatch;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo / top image area */}
          <View style={styles.heroArea}>
            {/* IMAGE PLACEHOLDER — replace with <Image source={require('@/assets/auth-hero.png')} style={StyleSheet.absoluteFillObject} /> */}
            <View style={styles.heroImagePlaceholder} />
            <View style={styles.logoBadge}>
              <Typography variant="h3" color={Colors.dark.primary} weight="bold">Stryft®</Typography>
            </View>
          </View>

          <View style={styles.card}>
            <Typography variant="h2" align="center" style={styles.cardTitle}>Sign Up For Free</Typography>

            {/* Email */}
            <Typography variant="caption" style={styles.label}>Email Address</Typography>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={Colors.dark.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={Colors.dark.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <Typography variant="caption" style={styles.label}>Password</Typography>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.dark.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={Colors.dark.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Typography variant="caption" style={styles.label}>Confirm Password</Typography>
            <View style={[styles.inputWrapper, passwordMismatch && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={18} color={passwordMismatch ? '#FF4444' : Colors.dark.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={Colors.dark.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
            {passwordMismatch && (
              <Typography variant="caption" color="#FF4444" style={{ marginBottom: 8, marginLeft: 4 }}>
                Passwords do not match
              </Typography>
            )}

            <CustomButton title="Sign Up" onPress={handleSignUp} loading={loading} disabled={!isValid} />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Typography variant="caption" style={{ marginHorizontal: 12 }}>or</Typography>
              <View style={styles.dividerLine} />
            </View>

            {/* Social logins */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={20} color={Colors.dark.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={20} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.push('/auth/signin')} style={styles.switchLink}>
              <Typography variant="caption" color={Colors.dark.textSecondary}>
                Already have an account?{' '}
                <Typography variant="caption" color={Colors.dark.primary} weight="bold">Sign In</Typography>
              </Typography>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  scroll: { flexGrow: 1 },
  heroArea: {
    height: 240,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  heroImagePlaceholder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.dark.backgroundElement,
  },
  logoBadge: {
    marginBottom: 20,
    zIndex: 2,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    marginTop: -28,
  },
  cardTitle: { marginBottom: 24 },
  label: {
    color: Colors.dark.textSecondary,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.dark.backgroundElement,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  switchLink: { alignItems: 'center', marginTop: 8 },
});
