import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../config/api";
import { COLORS } from "../config/colors";
import { useAuth } from "../context/AuthContext";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [materials, setMaterials] = useState([]);
  const [loadingMats, setLoadingMats] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await api.get("/invitations/my-materials");
      setMaterials(res.data.materials || []);
    } catch (e) {
      console.log("Materials error:", e?.response?.data);
    } finally {
      setLoadingMats(false);
    }
  };

  const confirmLogout = () =>
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);

  const TABS = ["home", "materials", "profile"];
  const TAB_LABELS = {
    home: "Home",
    materials: `Materials${materials.length > 0 ? ` (${materials.length})` : ""}`,
    profile: "Profile",
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello 👋</Text>
          <Text style={styles.name} numberOfLines={1}>
            {user?.fullName}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🎓 Student</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text
              style={[styles.tabText, activeTab === t && styles.tabTextActive]}
            >
              {TAB_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* HOME */}
        {activeTab === "home" && (
          <>
            {/* Info strip */}
            <View style={styles.infoStrip}>
              <View style={styles.infoItem}>
                <Text style={styles.infoVal}>{user?.section || "—"}</Text>
                <Text style={styles.infoKey}>Section</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoVal}>{user?.course || "—"}</Text>
                <Text style={styles.infoKey}>Course</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoVal}>{user?.schoolYear || "—"}</Text>
                <Text style={styles.infoKey}>S.Y.</Text>
              </View>
            </View>

            <View style={styles.grid}>
              {[
                { emoji: "📚", label: "My Courses" },
                { emoji: "📝", label: "Assignments" },
                { emoji: "📊", label: "Grades" },
                { emoji: "💬", label: "Messages" },
              ].map((item) => (
                <View key={item.label} style={styles.gridCard}>
                  <Text style={styles.gridEmoji}>{item.emoji}</Text>
                  <Text style={styles.gridLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* MATERIALS */}
        {activeTab === "materials" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Materials</Text>
            {loadingMats ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginTop: 30 }}
              />
            ) : materials.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyTitle}>No materials yet</Text>
                <Text style={styles.emptySub}>
                  Your instructor hasn't shared materials yet.
                </Text>
              </View>
            ) : (
              materials.map((inv, i) => (
                <View key={i} style={styles.matCard}>
                  <View style={styles.matCardHeader}>
                    <Text style={styles.matSection}>
                      Section: {inv.section}
                    </Text>
                    <View style={styles.matBadge}>
                      <Text style={styles.matBadgeText}>
                        {inv.materials.length} item(s)
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.matInstructor}>
                    👨‍🏫 {inv.instructor?.fullName} · {inv.instructor?.department}
                  </Text>
                  {inv.materials.length === 0 ? (
                    <Text style={styles.noMat}>No files uploaded yet</Text>
                  ) : (
                    inv.materials.map((m, j) => (
                      <View key={j} style={styles.matItem}>
                        <Text style={styles.matTypeTag}>
                          {m.type === "video"
                            ? "🎬"
                            : m.type === "module"
                              ? "📖"
                              : "📄"}{" "}
                          {m.type.toUpperCase()}
                        </Text>
                        <Text style={styles.matTitle}>{m.title}</Text>
                        {m.description ? (
                          <Text style={styles.matDesc}>{m.description}</Text>
                        ) : null}
                      </View>
                    ))
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Profile</Text>
            <View style={styles.profileCard}>
              {[
                ["Full Name", user?.fullName],
                ["Username", user?.username],
                ["Student ID", user?.userId],
                ["Birthday", user?.birthday],
                ["Course", user?.course],
                ["Section", user?.section],
                ["College", user?.college],
                ["Department", user?.department],
                ["School Year", user?.schoolYear],
              ].map(([k, v]) => (
                <View key={k} style={styles.profileRow}>
                  <Text style={styles.profileKey}>{k}</Text>
                  <Text style={styles.profileVal}>{v || "—"}</Text>
                </View>
              ))}
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
  tabText: { fontSize: 12, color: COLORS.gray, fontWeight: "600" },
  tabTextActive: { color: COLORS.primary, fontWeight: "800" },

  body: { flex: 1 },

  infoStrip: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  infoItem: { flex: 1, alignItems: "center" },
  infoVal: { fontSize: 14, fontWeight: "800", color: COLORS.primary },
  infoKey: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  infoDivider: { width: 1, backgroundColor: COLORS.light, marginVertical: 4 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
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

  empty: { alignItems: "center", padding: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: COLORS.dark },
  emptySub: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 4,
  },

  matCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  matCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  matSection: { fontSize: 15, fontWeight: "800", color: COLORS.primary },
  matBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  matBadgeText: { fontSize: 11, fontWeight: "700", color: COLORS.dark },
  matInstructor: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    marginBottom: 10,
  },
  noMat: { fontSize: 13, color: COLORS.gray, fontStyle: "italic" },
  matItem: {
    backgroundColor: COLORS.light,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  matTypeTag: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 2,
  },
  matTitle: { fontSize: 14, fontWeight: "700", color: COLORS.dark },
  matDesc: { fontSize: 12, color: COLORS.gray, marginTop: 2 },

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
});

export default StudentDashboard;
