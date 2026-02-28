import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../config/api";
import { COLORS } from "../config/colors";
import { useAuth } from "../context/AuthContext";

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  // Invite feature state
  const [searchSection, setSearchSection] = useState("");
  const [searchCollege, setSearchCollege] = useState("");
  const [searchDept, setSearchDept] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState([]);
  const [inviting, setInviting] = useState(false);

  // My classes state
  const [invitations, setInvitations] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  useEffect(() => {
    if (activeTab === "classes") fetchInvitations();
  }, [activeTab]);

  const fetchInvitations = async () => {
    setLoadingInvites(true);
    try {
      const res = await api.get("/invitations/my-invitations");
      setInvitations(res.data.invitations || []);
    } catch (e) {
      console.log("Invitations error:", e?.response?.data);
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleSearch = async () => {
    if (!searchSection.trim()) {
      Alert.alert("Required", "Please enter a section to search.");
      return;
    }
    setSearching(true);
    setSelected([]);
    try {
      const res = await api.get("/invitations/search-students", {
        params: {
          section: searchSection.trim(),
          college: searchCollege.trim() || undefined,
          department: searchDept.trim() || undefined,
          schoolYear: searchYear.trim() || undefined,
        },
      });
      setSearchResults(res.data.students || []);
      if (res.data.students.length === 0)
        Alert.alert("No Results", "No students match those criteria.");
    } catch (e) {
      Alert.alert(
        "Search Error",
        e?.response?.data?.message || "Search failed.",
      );
    } finally {
      setSearching(false);
    }
  };

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const handleSelectAll = () =>
    setSelected(
      selected.length === searchResults.length
        ? []
        : searchResults.map((s) => s._id),
    );

  const handleInvite = async () => {
    if (selected.length === 0) {
      Alert.alert("None selected", "Please select at least one student.");
      return;
    }
    setInviting(true);
    try {
      await api.post("/invitations/invite", {
        section: searchSection.trim(),
        college: searchCollege.trim() || null,
        department: searchDept.trim() || null,
        schoolYear: searchYear.trim() || null,
        studentIds: selected,
      });
      Alert.alert("Success! 🎉", `${selected.length} student(s) invited.`);
      setSearchResults([]);
      setSelected([]);
      setSearchSection("");
      setSearchCollege("");
      setSearchDept("");
      setSearchYear("");
    } catch (e) {
      Alert.alert(
        "Invite Error",
        e?.response?.data?.message || "Invitation failed.",
      );
    } finally {
      setInviting(false);
    }
  };

  const confirmLogout = () =>
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);

  const TABS = [
    { key: "home", label: "Home" },
    { key: "invite", label: "Invite" },
    { key: "classes", label: "My Classes" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.name} numberOfLines={1}>
            {user?.fullName}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>👨‍🏫 Instructor</Text>
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
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === t.key && styles.tabTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* HOME */}
        {activeTab === "home" && (
          <>
            <View style={styles.infoStrip}>
              <View style={styles.infoItem}>
                <Text style={styles.infoVal}>{user?.department || "—"}</Text>
                <Text style={styles.infoKey}>Department</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoVal}>{user?.schoolYear || "—"}</Text>
                <Text style={styles.infoKey}>S.Y.</Text>
              </View>
            </View>
            <View style={styles.grid}>
              {[
                { emoji: "📖", label: "My Classes" },
                { emoji: "👥", label: "Students" },
                { emoji: "📋", label: "Assignments" },
                { emoji: "📈", label: "Reports" },
              ].map((item) => (
                <View key={item.label} style={styles.gridCard}>
                  <Text style={styles.gridEmoji}>{item.emoji}</Text>
                  <Text style={styles.gridLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* INVITE */}
        {activeTab === "invite" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invite Students</Text>
            <Text style={styles.sectionSub}>
              Search by section, college, department, or school year
            </Text>

            <Text style={styles.label}>
              Section <Text style={styles.req}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. IT-3A"
              placeholderTextColor={COLORS.gray}
              value={searchSection}
              onChangeText={setSearchSection}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>
              College <Text style={styles.opt}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. College of Computing Studies"
              placeholderTextColor={COLORS.gray}
              value={searchCollege}
              onChangeText={setSearchCollege}
            />

            <Text style={styles.label}>
              Department <Text style={styles.opt}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Information Technology"
              placeholderTextColor={COLORS.gray}
              value={searchDept}
              onChangeText={setSearchDept}
            />

            <Text style={styles.label}>
              School Year <Text style={styles.opt}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2024-2025"
              placeholderTextColor={COLORS.gray}
              value={searchYear}
              onChangeText={setSearchYear}
            />

            <TouchableOpacity
              style={[styles.searchBtn, searching && { opacity: 0.6 }]}
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color={COLORS.dark} />
              ) : (
                <Text style={styles.searchBtnText}>🔍 Search Students</Text>
              )}
            </TouchableOpacity>

            {/* Results */}
            {searchResults.length > 0 && (
              <View style={styles.resultsBox}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsCount}>
                    {searchResults.length} student(s) found
                  </Text>
                  <TouchableOpacity onPress={handleSelectAll}>
                    <Text style={styles.selectAll}>
                      {selected.length === searchResults.length
                        ? "Deselect All"
                        : "Select All"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {searchResults.map((s) => (
                  <TouchableOpacity
                    key={s._id}
                    style={[
                      styles.studentRow,
                      selected.includes(s._id) && styles.studentRowSel,
                    ]}
                    onPress={() => toggleSelect(s._id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected.includes(s._id) && styles.checkboxSel,
                      ]}
                    >
                      {selected.includes(s._id) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <View>
                      <Text style={styles.studentName}>{s.fullName}</Text>
                      <Text style={styles.studentMeta}>
                        ID: {s.userId} · {s.section} · {s.course}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.inviteBtn,
                    (inviting || selected.length === 0) && { opacity: 0.5 },
                  ]}
                  onPress={handleInvite}
                  disabled={inviting || selected.length === 0}
                >
                  {inviting ? (
                    <ActivityIndicator color={COLORS.dark} />
                  ) : (
                    <Text style={styles.inviteBtnText}>
                      ✉️ Invite{" "}
                      {selected.length > 0 ? `(${selected.length}) ` : ""}
                      Selected
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* MY CLASSES */}
        {activeTab === "classes" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Classes</Text>
            {loadingInvites ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginTop: 30 }}
              />
            ) : invitations.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyTitle}>No classes yet</Text>
                <Text style={styles.emptySub}>
                  Use the Invite tab to get started.
                </Text>
              </View>
            ) : (
              invitations.map((inv) => (
                <View key={inv._id} style={styles.classCard}>
                  <View style={styles.classCardHeader}>
                    <Text style={styles.classSection}>
                      Section: {inv.section}
                    </Text>
                    <View style={styles.classBadge}>
                      <Text style={styles.classBadgeText}>
                        {inv.invitedStudents.length} students
                      </Text>
                    </View>
                  </View>
                  {inv.department && (
                    <Text style={styles.classMeta}>🏫 {inv.department}</Text>
                  )}
                  {inv.schoolYear && (
                    <Text style={styles.classMeta}>
                      📅 S.Y. {inv.schoolYear}
                    </Text>
                  )}
                  <Text style={styles.classMaterials}>
                    📁 {inv.materials.length} material(s) shared
                  </Text>
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
                ["Instructor ID", user?.userId],
                ["Birthday", user?.birthday],
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
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: COLORS.accent },
  tabText: { fontSize: 11, color: COLORS.gray, fontWeight: "600" },
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
    marginBottom: 4,
  },
  sectionSub: { fontSize: 13, color: COLORS.gray, marginBottom: 16 },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.dark,
    marginTop: 14,
    marginBottom: 5,
  },
  req: { color: COLORS.danger },
  opt: { fontWeight: "400", color: COLORS.gray },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: COLORS.dark,
    borderWidth: 1.5,
    borderColor: COLORS.light,
  },
  searchBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  searchBtnText: { color: COLORS.dark, fontWeight: "800", fontSize: 15 },

  resultsBox: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  resultsCount: { fontSize: 14, fontWeight: "700", color: COLORS.dark },
  selectAll: { color: COLORS.primary, fontWeight: "700", fontSize: 13 },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: COLORS.light,
    borderWidth: 1.5,
    borderColor: COLORS.light,
  },
  studentRowSel: { backgroundColor: "#EEF1FF", borderColor: COLORS.primary },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSel: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: "900" },
  studentName: { fontSize: 14, fontWeight: "700", color: COLORS.dark },
  studentMeta: { fontSize: 11, color: COLORS.gray, marginTop: 1 },
  inviteBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  inviteBtnText: { color: COLORS.dark, fontWeight: "800", fontSize: 14 },

  empty: { alignItems: "center", padding: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: COLORS.dark },
  emptySub: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 4,
  },

  classCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  classCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  classSection: { fontSize: 15, fontWeight: "800", color: COLORS.primary },
  classBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  classBadgeText: { fontSize: 11, fontWeight: "700", color: COLORS.dark },
  classMeta: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  classMaterials: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 6,
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
});

export default InstructorDashboard;
