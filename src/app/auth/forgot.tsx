import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    if (!email) return;
    setLoading(true);
    // TODO: Supabase reset
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.dark.text} />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="lock-open-outline" size={40} color={Colors.dark.primary} />
        </View>

        <Typography variant="h2" align="center" style={styles.title}>Reset Password</Typography>
        <Typography variant="body" align="center" color={Colors.dark.textSecondary} style={styles.subtitle}>
          {sent
            ? `We've sent a reset link to ${email}. Check your inbox and follow the instructions.`
            : 'Enter your email and we will send you a link to reset your password.'}
        </Typography>

        {!sent && (
          <>
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

            <CustomButton title="Reset Password" onPress={handleReset} loading={loading} disabled={!email} />
          </>
        )}

        {sent && (
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={22} color="#00C853" />
            <Typography variant="body" color="#00C853" style={{ marginLeft: 8 }}>Reset link sent!</Typography>
          </View>
        )}

        <TouchableOpacity onPress={() => router.push('/auth/signin')} style={styles.backToSignIn}>
          <Ionicons name="arrow-back-outline" size={16} color={Colors.dark.primary} />
          <Typography variant="caption" color={Colors.dark.primary} style={{ marginLeft: 4 }}>Back to Sign In</Typography>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 24,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundElement,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,102,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,102,0,0.3)',
  },
  title: { marginBottom: 12 },
  subtitle: {
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  label: {
    alignSelf: 'flex-start',
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
    marginBottom: 8,
    width: '100%',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,200,83,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,200,83,0.3)',
    marginTop: 16,
  },
  backToSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
  },
});
