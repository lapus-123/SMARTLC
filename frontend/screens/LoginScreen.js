import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../config/colors";
import { useAuth } from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  const roleLabel = (r) =>
    r === "admin"
      ? "Administrator"
      : r === "instructor"
        ? "Instructor / Professor"
        : "Student";

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Validation", "Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const { user } = await login(username.trim(), password.trim());
      setLoggedUser(user);
      setPopup(true);
    } catch (e) {
      Alert.alert("Login Error", e?.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Success Popup */}
      <Modal transparent visible={popup} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <View style={styles.popupIcon}>
              <Text style={styles.popupEmoji}>🎉</Text>
            </View>
            <Text style={styles.popupTitle}>Login Successful!</Text>
            <Text style={styles.popupName}>{loggedUser?.fullName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {roleLabel(loggedUser?.role)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.popupBtn}
              onPress={() => setPopup(false)}
            >
              <Text style={styles.popupBtnText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>SL</Text>
          </View>
          <Text style={styles.appName}>SmartLearningICT</Text>
          <Text style={styles.tagline}>Login to your account</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.hint}>
            Your birthday in MMDD format (e.g. 0918)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0918"
            placeholderTextColor={COLORS.gray}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="numeric"
            maxLength={4}
          />

          <Text style={styles.label}>Password</Text>
          <Text style={styles.hint}>Your Student ID or Instructor ID</Text>
          <View style={styles.passRow}>
            <TextInput
              style={styles.passInput}
              placeholder="Enter your ID number"
              placeholderTextColor={COLORS.gray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.toggle}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.dark} />
            ) : (
              <Text style={styles.btnText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>No account yet? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin hint */}
        <View style={styles.adminHint}>
          <Text style={styles.adminHintText}>
            Admin? Use your admin username &amp; password.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },

  header: { alignItems: "center", marginBottom: 32 },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 4,
    borderColor: COLORS.accent,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: { color: COLORS.white, fontSize: 30, fontWeight: "900" },
  appName: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  tagline: { fontSize: 14, color: COLORS.gray, marginTop: 4 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 2,
  },
  hint: { fontSize: 11, color: COLORS.gray, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.light,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: COLORS.dark,
    borderWidth: 1.5,
    borderColor: COLORS.light,
  },
  passRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light,
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.light,
  },
  passInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: COLORS.dark },
  toggle: { color: COLORS.primary, fontWeight: "700", fontSize: 13 },

  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  btnText: { color: COLORS.dark, fontWeight: "800", fontSize: 16 },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: { color: COLORS.gray, fontSize: 14 },
  registerLink: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },

  adminHint: { alignItems: "center", marginTop: 16 },
  adminHintText: { color: COLORS.gray, fontSize: 12 },

  // Popup
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "82%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  popupIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  popupEmoji: { fontSize: 36 },
  popupTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 6,
  },
  popupName: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: "600",
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 20,
  },
  roleBadgeText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
  popupBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 13,
  },
  popupBtnText: { color: COLORS.dark, fontWeight: "800", fontSize: 15 },
});

export default LoginScreen;
