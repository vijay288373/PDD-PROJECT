import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Animated, Easing, KeyboardAvoidingView, Platform, 
  ActivityIndicator, ScrollView, Dimensions, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sprout, Mail, Lock, User, Eye, EyeOff, Sparkles, Tractor, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../lib/AuthContext';
import { useLang } from '../lib/useLang';
import { t } from '../lib/i18n';

const { width, height } = Dimensions.get('window');

const FloatingParticle = ({ size, initialX, initialY, duration, delay }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -100,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ]),
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: (Math.random() - 0.5) * 50,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ]),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.1,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ])
        ])
      ).start();
    };
    
    setTimeout(startAnimation, Math.max(0, -delay));
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        left: initialX,
        top: initialY,
        transform: [{ translateY }, { translateX }],
        opacity,
      }}
    />
  );
};

export default function LoginScreen() {
  const { login, register } = useAuth();
  const { langCode } = useLang();

  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTypingDemo, setIsTypingDemo] = useState(false);

  const [dots, setDots] = useState([]);
  useEffect(() => {
    const generatedDots = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 12 + 6,
      duration: Math.random() * 20000 + 20000,
      delay: Math.random() * -20000,
    }));
    setDots(generatedDots);
  }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;
  const tabIndicatorX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    Animated.spring(tabIndicatorX, {
      toValue: isSignIn ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [isSignIn]);

  const handleAuth = async () => {
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg(t("fill_all_credentials", langCode) || "Please fill all credentials");
      return;
    }

    if (email.indexOf('@') === -1) {
      setErrorMsg(t("invalid_email", langCode) || "Invalid email address");
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t("password_short", langCode) || "Password must be at least 6 characters");
      return;
    }

    if (!isSignIn && !fullName.trim()) {
      setErrorMsg(t("enter_full_name", langCode) || "Please enter your full name");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignIn) {
        await login(email, password);
        Alert.alert(
          t("welcome_back", langCode) || "Welcome Back! 🌾",
          t("logged_in_success", langCode) || "Logged in successfully as Demo Farmer."
        );
      } else {
        await register(fullName, email, password);
        Alert.alert(
          t("account_created", langCode) || "Account Created! 🎉",
          `${t("welcome_user", langCode) || "Welcome to Agri Guard AI"}, ${fullName}!`
        );
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    if (isTypingDemo || isLoading) return;
    setIsTypingDemo(true);
    setIsSignIn(true);
    setErrorMsg('');
    
    setEmail('');
    setPassword('');
    setFullName('');

    const targetEmail = 'farmer@agriguard.com';
    const targetPassword = 'password123';
    
    let currentEmail = '';
    let currentPassword = '';
    
    let emailIdx = 0;
    const typeEmailInterval = setInterval(() => {
      if (emailIdx < targetEmail.length) {
        currentEmail += targetEmail[emailIdx];
        setEmail(currentEmail);
        emailIdx++;
      } else {
        clearInterval(typeEmailInterval);
        
        let passIdx = 0;
        const typePasswordInterval = setInterval(() => {
          if (passIdx < targetPassword.length) {
            currentPassword += targetPassword[passIdx];
            setPassword(currentPassword);
            passIdx++;
          } else {
            clearInterval(typePasswordInterval);
            
            setTimeout(async () => {
              setIsTypingDemo(false);
              setIsLoading(true);
              try {
                await login(targetEmail, targetPassword);
                Alert.alert(
                  t("demo_active", langCode) || "Demo Account Active! 👨‍🌾",
                  t("demo_active_desc", langCode) || "Entered as Demo Farmer. Happy farming!"
                );
              } catch (err) {
                setErrorMsg(err.message);
                setIsLoading(false);
              }
            }, 500);
          }
        }, 80);
      }
    }, 60);
  };

  const tabIndicatorLeft = tabIndicatorX.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '50%']
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient
        colors={['#022c22', '#0f766e', '#052e16']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={[styles.ambientLight, styles.ambientLightTop]} />
      <View style={[styles.ambientLight, styles.ambientLightBottom]} />

      {dots.map((dot) => (
        <FloatingParticle key={dot.id} {...dot} initialX={dot.x} initialY={dot.y} />
      ))}

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View 
          style={[
            styles.card, 
            { opacity: fadeAnim, transform: [{ translateY: slideY }] }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#10b981', '#4ade80']}
                style={styles.logoGradient}
              >
                <Sprout color="#0a1e12" size={32} />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>{t("app_name", langCode) || 'Agri Guard AI'}</Text>
            <Text style={styles.tagline}>{t("tagline", langCode) || 'SMART FARMING ASSISTANT'}</Text>
          </View>

          <View style={styles.tabContainer}>
            <Animated.View style={[styles.activeTabIndicator, { left: tabIndicatorLeft }]} />
            <TouchableOpacity 
              style={styles.tabButton} 
              onPress={() => { setIsSignIn(true); setErrorMsg(''); }}
              disabled={isTypingDemo || isLoading}
            >
              <Text style={[styles.tabText, isSignIn ? styles.activeTabText : styles.inactiveTabText]}>
                {t("sign_in", langCode) || 'Sign In'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tabButton} 
              onPress={() => { setIsSignIn(false); setErrorMsg(''); }}
              disabled={isTypingDemo || isLoading}
            >
              <Text style={[styles.tabText, !isSignIn ? styles.activeTabText : styles.inactiveTabText]}>
                {t("create_account", langCode) || 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorContainer}>
              <AlertCircle color="#ef4444" size={20} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.formContainer}>
            {!isSignIn && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("lbl_full_name", langCode) || 'Full Name'}</Text>
                <View style={styles.inputWrapper}>
                  <User color="rgba(16, 185, 129, 0.6)" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#64748b"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!(isLoading || isTypingDemo)}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("lbl_email", langCode) || 'Email Address'}</Text>
              <View style={styles.inputWrapper}>
                <Mail color="rgba(16, 185, 129, 0.6)" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="farmer@example.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!(isLoading || isTypingDemo)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>{t("lbl_password", langCode) || 'Password'}</Text>
                {isSignIn && (
                  <TouchableOpacity>
                    <Text style={styles.forgotText}>{t("forgot_password", langCode) || 'Forgot Password?'}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputWrapper}>
                <Lock color="rgba(16, 185, 129, 0.6)" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!(isLoading || isTypingDemo)}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isTypingDemo}
                >
                  {showPassword ? (
                    <EyeOff color="#94a3b8" size={20} />
                  ) : (
                    <Eye color="#94a3b8" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleAuth}
              disabled={isLoading || isTypingDemo}
            >
              <LinearGradient
                colors={['#10b981', '#4ade80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#0a1e12" />
                ) : (
                  <>
                    <Sparkles color="#0a1e12" size={20} />
                    <Text style={styles.submitText}>
                      {isSignIn ? (t("sign_in_to_farm", langCode) || 'Sign In to Farm') : (t("create_account", langCode) || 'Create Account')}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("quick_sandbox_access", langCode) || 'QUICK SANDBOX ACCESS'}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.demoBtn} 
            onPress={handleDemoAccess}
            disabled={isLoading || isTypingDemo}
          >
            {isTypingDemo ? (
              <>
                <ActivityIndicator color="#34d399" style={{ marginRight: 8 }} />
                <Text style={styles.demoBtnTextActive}>{t("simulating_entry", langCode) || 'Simulating entry...'}</Text>
              </>
            ) : (
              <>
                <Tractor color="#34d399" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.demoBtnText}>{t("use_demo_farmer", langCode) || 'Use Demo Farmer'}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.highlightsContainer}>
            <View style={styles.highlightItem}>
              <CheckCircle2 color="rgba(16, 185, 129, 0.6)" size={14} />
              <Text style={styles.highlightText}>{t("live_ai_diagnose", langCode) || 'Live AI Diagnose'}</Text>
            </View>
            <View style={styles.highlightItem}>
              <CheckCircle2 color="rgba(16, 185, 129, 0.6)" size={14} />
              <Text style={styles.highlightText}>{t("mandi_tracking", langCode) || 'Mandi Tracking'}</Text>
            </View>
            <View style={styles.highlightItem}>
              <CheckCircle2 color="rgba(16, 185, 129, 0.6)" size={14} />
              <Text style={styles.highlightText}>{t("weather_alerts_label", langCode) || 'Weather Alerts'}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#052e16' },
  ambientLight: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(16, 185, 129, 0.1)', zIndex: 0 },
  ambientLightTop: { top: '10%', left: '10%' },
  ambientLightBottom: { bottom: '10%', right: '10%' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, zIndex: 10 },
  card: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  header: { alignItems: 'center', marginBottom: 24 },
  logoContainer: { marginBottom: 12, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  logoGradient: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 28, fontWeight: '800', color: '#34d399', marginBottom: 4 },
  tagline: { fontSize: 12, color: 'rgba(16, 185, 129, 0.8)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: 1 },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 12, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative' },
  activeTabIndicator: { position: 'absolute', top: 4, bottom: 4, width: '48%', backgroundColor: '#10b981', borderRadius: 8, zIndex: 1 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', zIndex: 2 },
  tabText: { fontSize: 14, fontWeight: '600' },
  activeTabText: { color: '#0a1e12' },
  inactiveTabText: { color: '#94a3b8' },
  errorContainer: { flexDirection: 'row', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: 12, marginBottom: 20, alignItems: 'center' },
  errorText: { color: '#ef4444', fontSize: 14, marginLeft: 8, flex: 1 },
  formContainer: { gap: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, color: '#34d399', fontWeight: '600', marginBottom: 4 },
  passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  forgotText: { fontSize: 10, color: '#10b981', fontWeight: '500' },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 12, zIndex: 1 },
  input: { backgroundColor: 'rgba(15, 23, 42, 0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingVertical: 16, paddingLeft: 44, paddingRight: 44, color: '#ffffff', fontSize: 14 },
  eyeIcon: { position: 'absolute', right: 12, zIndex: 1 },
  submitBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  submitText: { color: '#0a1e12', fontSize: 16, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: '#64748b', fontSize: 10, fontWeight: '600', paddingHorizontal: 12, backgroundColor: 'transparent' },
  demoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingVertical: 16 },
  demoBtnText: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  demoBtnTextActive: { color: '#34d399', fontSize: 14, fontWeight: '600' },
  highlightsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  highlightItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  highlightText: { color: '#64748b', fontSize: 10 },
});
