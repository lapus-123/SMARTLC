import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../config/colors";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  const confirmLogout = () =>
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>System Administrator 🛡️</Text>
          <Text style={styles.name}>{user?.fullName}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⚙️ Admin</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {["home", "profile"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text
              style={[styles.tabText, activeTab === t && styles.tabTextActive]}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {activeTab === "home" && (
          <View style={styles.grid}>
            {[
              { emoji: "👥", label: "Manage Users" },
              { emoji: "📖", label: "Courses" },
              { emoji: "📊", label: "Analytics" },
              { emoji: "⚙️", label: "Settings" },
            ].map((item) => (
              <View key={item.label} style={styles.gridCard}>
                <Text style={styles.gridEmoji}>{item.emoji}</Text>
                <Text style={styles.gridLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === "profile" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Profile</Text>
            <View style={styles.profileCard}>
              {[
                ["Name", user?.fullName],
                ["Username", user?.username || "admin"],
                ["Role", "System Administrator"],
              ].map(([k, v]) => (
                <View key={k} style={styles.profileRow}>
                  <Text style={styles.profileKey}>{k}</Text>
                  <Text style={styles.profileVal}>{v || "—"}</Text>
                </View>
              ))}
            </View>
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>
                ⚠️ Admin account has full system privileges. Keep credentials
                secure.
              </Text>
            </View>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1 },
  greeting: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  name: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  badgeText: { color: COLORS.dark, fontWeight: "800", fontSize: 12 },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 6,
  },
  logoutText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },

  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  tab: { flex: 1, paddingVertical: 13, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: COLORS.accent },
  tabText: { fontSize: 13, color: COLORS.gray, fontWeight: "600" },
  tabTextActive: { color: COLORS.primary, fontWeight: "800" },

  body: { flex: 1 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
    justifyContent: "center",
  },
  gridCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "44%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.accent,
  },
  gridEmoji: { fontSize: 30, marginBottom: 8 },
  gridLabel: {
    fontWeight: "700",
    color: COLORS.dark,
    fontSize: 13,
    textAlign: "center",
  },

  section: { padding: 16 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 14,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 2,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  profileKey: { fontSize: 13, color: COLORS.gray, fontWeight: "600" },
  profileVal: {
    fontSize: 13,
    color: COLORS.dark,
    fontWeight: "700",
    maxWidth: "55%",
    textAlign: "right",
  },
  warnBox: {
    backgroundColor: "#FFFBEA",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  warnText: { fontSize: 12, color: "#7A5500" },
});

export default AdminDashboard;
