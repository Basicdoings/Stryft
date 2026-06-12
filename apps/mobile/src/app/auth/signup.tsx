import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { Typography } from '@/components/Typography';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

// GoogleSignin.configure({
//   scopes: ['https://www.googleapis.com/auth/userinfo.email'],
//   webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID',
// });

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
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    
    if (error) {
      Alert.alert('Sign Up Error', error.message);
    } else {
      Alert.alert('Success', 'Please check your email to verify your account.', [
        { text: 'OK', onPress: () => router.replace('/splash/slide1') }
      ]);
    }
  };

  const handleAppleSignUp = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        setLoading(true);
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        setLoading(false);
        if (error) throw error;
        router.replace('/splash/slide1');
      }
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Sign-Up Error', e.message);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    Alert.alert('Google Sign-Up', 'Google Sign-Up requires a custom dev client. It is disabled in Expo Go.');
    // try {
    //   await GoogleSignin.hasPlayServices();
    //   const response = await GoogleSignin.signIn();
    //   if (response.data?.idToken) {
    //     setLoading(true);
    //     const { error } = await supabase.auth.signInWithIdToken({
    //       provider: 'google',
    //       token: response.data.idToken,
    //     });
    //     setLoading(false);
    //     if (error) throw error;
    //     router.replace('/splash/slide1');
    //   }
    // } catch (e: any) {
    //   Alert.alert('Google Sign-Up Error', e.message);
    // }
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
          <Animated.View style={styles.heroArea} entering={FadeInDown.duration(800)}>
            <LinearGradient
              colors={['#FF6B00', '#111111']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.logoBadge}>
              <Typography variant="h3" color="#ffffff" weight="bold">Stryft®</Typography>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.cardContainer}>
            <GlassView style={styles.card} colorScheme="dark">
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
              <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleSignUp}>
                <Ionicons name="logo-google" size={20} color={Colors.dark.text} />
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity style={styles.socialBtn} onPress={handleAppleSignUp}>
                  <Ionicons name="logo-apple" size={20} color={Colors.dark.text} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={() => router.push('/auth/signin')} style={styles.switchLink}>
              <Typography variant="caption" color={Colors.dark.textSecondary}>
                Already have an account?{' '}
                <Typography variant="caption" color={Colors.dark.primary} weight="bold">Sign In</Typography>
              </Typography>
            </TouchableOpacity>
            </GlassView>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  scroll: { flexGrow: 1 },
  heroArea: {
    height: 300,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardContainer: {
    flex: 1,
    marginTop: -40,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
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
