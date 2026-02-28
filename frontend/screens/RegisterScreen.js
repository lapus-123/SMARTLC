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

const SCHOOL_YEARS = ["2023-2024", "2024-2025", "2025-2026", "2026-2027"];

// MM/DD/YYYY → "MMDD"
const birthdayToUsername = (bday) => {
  const parts = bday.split("/");
  if (parts.length !== 3) return null;
  return `${parts[0].padStart(2, "0")}${parts[1].padStart(2, "0")}`;
};

const isValidBirthday = (bday) =>
  /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(bday);

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState("");
  const [birthday, setBirthday] = useState("");
  const [course, setCourse] = useState("");
  const [section, setSection] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(false);

  // Live preview of generated username
  const previewUsername = isValidBirthday(birthday)
    ? birthdayToUsername(birthday)
    : null;

  const handleRegister = async () => {
    if (!fullName.trim() || !userId.trim() || !birthday.trim()) {
      Alert.alert("Validation", "Full name, ID, and birthday are required.");
      return;
    }
    if (!isValidBirthday(birthday)) {
      Alert.alert(
        "Validation",
        "Birthday must be in MM/DD/YYYY format (e.g. 09/18/2002).",
      );
      return;
    }
    if (!college.trim() || !department.trim() || !schoolYear) {
      Alert.alert(
        "Validation",
        "College, department, and school year are required.",
      );
      return;
    }
    if (role === "student" && (!course.trim() || !section.trim())) {
      Alert.alert(
        "Validation",
        "Course and section are required for students.",
      );
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        userId: userId.trim(),
        birthday: birthday.trim(),
        role,
        college: college.trim(),
        department: department.trim(),
        schoolYear,
        course: role === "student" ? course.trim() : undefined,
        section: role === "student" ? section.trim() : undefined,
      });
      setPopup(true);
    } catch (e) {
      Alert.alert(
        "Registration Error",
        e?.response?.data?.message || "Registration failed.",
      );
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
              <Text style={styles.popupEmoji}>✅</Text>
            </View>
            <Text style={styles.popupTitle}>Registration Successful!</Text>
            <Text style={styles.popupSub}>Your account has been created.</Text>
            <View style={styles.credBox}>
              <Text style={styles.credLabel}>Your Username</Text>
              <Text style={styles.credValue}>
                {previewUsername || birthdayToUsername(birthday)}
              </Text>
              <Text style={styles.credLabel} marginTop={8}>
                Your Password
              </Text>
              <Text style={styles.credValue}>{userId}</Text>
            </View>
            <Text style={styles.credNote}>
              Save these credentials — they are used to login.
            </Text>
            <TouchableOpacity
              style={styles.popupBtn}
              onPress={() => setPopup(false)}
            >
              <Text style={styles.popupBtnText}>Go to Dashboard →</Text>
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
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <View style={styles.card}>
          {/* Role Selector */}
          <Text style={styles.sectionHead}>I am a...</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === "student" && styles.roleBtnActive,
              ]}
              onPress={() => setRole("student")}
            >
              <Text style={styles.roleEmoji}>🎓</Text>
              <Text
                style={[
                  styles.roleLabel,
                  role === "student" && styles.roleLabelActive,
                ]}
              >
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === "instructor" && styles.roleBtnActive,
              ]}
              onPress={() => setRole("instructor")}
            >
              <Text style={styles.roleEmoji}>👨‍🏫</Text>
              <Text
                style={[
                  styles.roleLabel,
                  role === "instructor" && styles.roleLabelActive,
                ]}
              >
                Instructor / Professor
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.gray}
            value={fullName}
            onChangeText={setFullName}
          />

          {/* User ID */}
          <Text style={styles.label}>
            {role === "student" ? "Student ID" : "Instructor ID"}
          </Text>
          <Text style={styles.hint}>This will be your login password</Text>
          <TextInput
            style={styles.input}
            placeholder={
              role === "student" ? "e.g. 2024-00123" : "e.g. INS-2024-001"
            }
            placeholderTextColor={COLORS.gray}
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
          />

          {/* Birthday */}
          <Text style={styles.label}>Birthday</Text>
          <Text style={styles.hint}>
            Format: MM/DD/YYYY — this generates your username
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 09/18/2002"
            placeholderTextColor={COLORS.gray}
            value={birthday}
            onChangeText={setBirthday}
            keyboardType="numeric"
            maxLength={10}
          />

          {/* Username Preview */}
          {previewUsername && (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Generated Username:</Text>
              <Text style={styles.previewValue}>{previewUsername}</Text>
            </View>
          )}

          {/* Student-only fields */}
          {role === "student" && (
            <>
              <Text style={styles.label}>Course</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. BS Information Technology"
                placeholderTextColor={COLORS.gray}
                value={course}
                onChangeText={setCourse}
              />

              <Text style={styles.label}>Section</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. IT-3A"
                placeholderTextColor={COLORS.gray}
                value={section}
                onChangeText={setSection}
                autoCapitalize="characters"
              />
            </>
          )}

          {/* Shared fields */}
          <Text style={styles.label}>College</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. College of Computing Studies"
            placeholderTextColor={COLORS.gray}
            value={college}
            onChangeText={setCollege}
          />

          <Text style={styles.label}>Department</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Information Technology"
            placeholderTextColor={COLORS.gray}
            value={department}
            onChangeText={setDepartment}
          />

          <Text style={styles.label}>School Year</Text>
          <View style={styles.yearRow}>
            {SCHOOL_YEARS.map((yr) => (
              <TouchableOpacity
                key={yr}
                style={[
                  styles.yearBtn,
                  schoolYear === yr && styles.yearBtnActive,
                ]}
                onPress={() => setSchoolYear(yr)}
              >
                <Text
                  style={[
                    styles.yearText,
                    schoolYear === yr && styles.yearTextActive,
                  ]}
                >
                  {yr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              ℹ️ Username = MMDD from birthday{"\n"}
              🔒 Password = your {role === "student"
                ? "Student"
                : "Instructor"}{" "}
              ID
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.dark} />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 48 },

  header: { alignItems: "center", marginBottom: 28 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 4,
    borderColor: COLORS.accent,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: { color: COLORS.white, fontSize: 28, fontWeight: "900" },
  appName: { fontSize: 24, fontWeight: "900", color: COLORS.primary },
  tagline: { fontSize: 14, color: COLORS.gray, marginTop: 4 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionHead: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.dark,
    marginBottom: 10,
  },
  roleRow: { flexDirection: "row", gap: 12 },
  roleBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.light,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    backgroundColor: COLORS.light,
  },
  roleBtnActive: { borderColor: COLORS.primary, backgroundColor: "#EEF1FF" },
  roleEmoji: { fontSize: 28, marginBottom: 4 },
  roleLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.gray,
    textAlign: "center",
  },
  roleLabelActive: { color: COLORS.primary },

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

  previewBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF1FF",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  previewLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
    marginRight: 8,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: 2,
  },

  yearRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  yearBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.light,
  },
  yearBtnActive: { borderColor: COLORS.primary, backgroundColor: "#EEF1FF" },
  yearText: { fontSize: 13, color: COLORS.gray, fontWeight: "600" },
  yearTextActive: { color: COLORS.primary, fontWeight: "800" },

  infoBanner: {
    backgroundColor: "#FFFBEA",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  infoText: { fontSize: 12, color: "#7A5500", lineHeight: 20 },

  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  btnText: { color: COLORS.dark, fontWeight: "800", fontSize: 16 },

  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  loginText: { color: COLORS.gray, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },

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
    padding: 28,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  popupIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  popupEmoji: { fontSize: 34 },
  popupTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 6,
  },
  popupSub: { fontSize: 13, color: COLORS.gray, marginBottom: 14 },
  credBox: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
  },
  credLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  credValue: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: 2,
    marginTop: 2,
    marginBottom: 8,
  },
  credNote: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 16,
  },
  popupBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 36,
    paddingVertical: 13,
  },
  popupBtnText: { color: COLORS.dark, fontWeight: "800", fontSize: 15 },
});

export default RegisterScreen;
