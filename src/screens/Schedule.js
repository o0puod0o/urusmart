/**
 * Schedulepage.js – ตารางสอน + ปฏิทินรายเทอม
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

// ══════════════════════════════════════════════════════════════
// ① API CONFIG
// ══════════════════════════════════════════════════════════════
const BASE_URL = "https://your-api.example.com";
const ENDPOINTS = {
  schedule: "/api/schedule",
  holidays: "/api/holidays",
};

const apiFetch = async (path, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${path}${qs ? "?" + qs : ""}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// ══════════════════════════════════════════════════════════════
// ② MOCK DATA
// ══════════════════════════════════════════════════════════════
const MOCK_SCHEDULE = [
  {
    id: "1",
    subject_code: "IT101",
    subject_name: "คณิตศาสตร์ดิสครีต",
    day_of_week: 1,
    start_time: "08:00",
    end_time: "10:00",
    room: "A201",
    group: "ก.2",
    student_count: 38,
    type: "lecture",
  },
  {
    id: "2",
    subject_code: "IT203",
    subject_name: "ปฏิบัติการเครือข่ายคอมพิวเตอร์",
    day_of_week: 1,
    start_time: "13:00",
    end_time: "16:00",
    room: "LAB2",
    group: "ข.1",
    student_count: 25,
    type: "lab",
  },
  {
    id: "3",
    subject_code: "CS301",
    subject_name: "โครงสร้างข้อมูลและอัลกอริทึม",
    day_of_week: 2,
    start_time: "09:00",
    end_time: "12:00",
    room: "CB301",
    group: "ก.1",
    student_count: 42,
    type: "lecture",
  },
  {
    id: "4",
    subject_code: "SE405",
    subject_name: "สัมมนาวิศวกรรมซอฟต์แวร์",
    day_of_week: 3,
    start_time: "10:00",
    end_time: "12:00",
    room: "SEM1",
    group: "",
    student_count: 20,
    type: "seminar",
  },
  {
    id: "5",
    subject_code: "CS301",
    subject_name: "ปฏิบัติการโครงสร้างข้อมูล",
    day_of_week: 3,
    start_time: "13:30",
    end_time: "16:30",
    room: "LAB1",
    group: "ก.1",
    student_count: 42,
    type: "lab",
  },
  {
    id: "6",
    subject_code: "IT401",
    subject_name: "ปัญญาประดิษฐ์เบื้องต้น",
    day_of_week: 5,
    start_time: "09:00",
    end_time: "12:00",
    room: "CB201",
    group: "ก.3",
    student_count: 35,
    type: "lecture",
  },
];

const _hkey = (mOff, day) => {
  const d = new Date();
  d.setMonth(d.getMonth() + mOff);
  d.setDate(day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};
const MOCK_HOLIDAYS = [
  { date: _hkey(0, 5), name: "วันหยุดพิเศษ" },
  { date: _hkey(0, 15), name: "วันมหิดล" },
  { date: _hkey(1, 3), name: "วันวิสาขบูชา" },
  { date: _hkey(1, 20), name: "วันอาสาฬหบูชา" },
];

// ══════════════════════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════════════════════
const C = {
  g900: "#043d2a",
  g700: "#0a6644",
  g500: "#0f7a55",
  g400: "#1a9068",
  g300: "#5aab8a",
  g100: "#c8e8d8",
  g50: "#eef8f3",
  g20: "#f6fcf9",
  ink: "#111c18",
  sub: "#4a5e56",
  dim: "#8fa89f",
  line: "#dce8e2",
  card: "#ffffff",
  bg: "#f0f6f2",
  gold: "#c9a227",
  type: {
    lecture: { bg: "#e8f4ff", text: "#1a5fa8", dot: "#3b82f6", bar: "#3b82f6" },
    lab: { bg: "#fff3e0", text: "#b45309", dot: "#f59e0b", bar: "#f59e0b" },
    seminar: { bg: "#f3e8ff", text: "#7c3aed", dot: "#a78bfa", bar: "#a78bfa" },
  },
};

const HDR_GRADIENT = ["#064e35", "#0f7a55"];

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];
const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];
const DOW_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const DOW_FULL = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
];
const DOW_API = [null, "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
const TYPE_LABEL = { lecture: "บรรยาย", lab: "ปฏิบัติ", seminar: "สัมมนา" };

const VIEWS = [
  {
    key: "month",
    label: "เดือน",
    icon: "calendar-outline",
    iconActive: "calendar",
  },
  {
    key: "week",
    label: "สัปดาห์",
    icon: "calendar-number-outline",
    iconActive: "calendar-number",
  },
  { key: "list", label: "รายวัน", icon: "list-outline", iconActive: "list" },
];

// ══════════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════════
const fmtKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const calcHrs = (s, e) => {
  if (!s || !e) return 0;
  const [sh, sm] = s.split(":").map(Number);
  const [eh, em] = e.split(":").map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
};

const normalizeSchedule = (arr) =>
  arr.map((d) => ({
    id: d.id ?? String(Math.random()),
    subject_code: d.subject_code ?? d.code ?? "",
    subject_name: d.subject_name ?? d.name ?? "",
    day_of_week: d.day_of_week ?? d.dow ?? 1,
    start_time: d.start_time ?? d.time_start ?? "",
    end_time: d.end_time ?? d.time_end ?? "",
    room: d.room ?? "",
    group: d.group ?? d.section ?? "",
    student_count: d.student_count ?? d.students ?? 0,
    type: d.type ?? "lecture",
  }));

const normalizeHolidays = (arr) => {
  const map = {};
  arr.forEach((h) => {
    map[h.date] = h.name;
  });
  return map;
};

const groupByDay = (schedule) => {
  const map = {};
  schedule.forEach((s) => {
    if (!map[s.day_of_week]) map[s.day_of_week] = [];
    map[s.day_of_week].push(s);
  });
  Object.values(map).forEach((a) =>
    a.sort((x, y) => x.start_time.localeCompare(y.start_time)),
  );
  return map;
};

// ══════════════════════════════════════════════════════════════
// SHARED SMALL COMPONENTS
// ══════════════════════════════════════════════════════════════
const TypeBadge = ({ type }) => {
  const t = C.type[type] ?? C.type.lecture;
  return (
    <View style={[TB.wrap, { backgroundColor: t.bg }]}>
      <View style={[TB.dot, { backgroundColor: t.dot }]} />
      <Text style={[TB.txt, { color: t.text }]}>
        {TYPE_LABEL[type] ?? type}
      </Text>
    </View>
  );
};
const TB = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  txt: { fontSize: 10, fontWeight: "800" },
});

const EmptyDay = () => (
  <View style={ED.wrap}>
    <View style={ED.box}>
      <Ionicons name="calendar-outline" size={26} color={C.g300} />
    </View>
    <Text style={ED.title}>ไม่มีคาบสอน</Text>
    <Text style={ED.sub}>วันนี้ว่างทั้งวัน</Text>
  </View>
);
const ED = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 32, gap: 8 },
  box: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: C.g50,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: C.ink, fontSize: 14, fontWeight: "800" },
  sub: { color: C.dim, fontSize: 12, fontWeight: "600" },
});

const NavArrow = ({ dir, onPress }) => (
  <TouchableOpacity style={NA.btn} onPress={onPress} activeOpacity={0.7}>
    <Ionicons
      name={dir === "left" ? "chevron-back" : "chevron-forward"}
      size={16}
      color={C.g500}
    />
  </TouchableOpacity>
);
const NA = StyleSheet.create({
  btn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.g50,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ══════════════════════════════════════════════════════════════
// VIEW: MONTH
// ══════════════════════════════════════════════════════════════
const MonthView = ({ year, month, byDay, holidays, onChangeMonth }) => {
  const [selKey, setSelKey] = useState(null);
  const today = new Date();
  const todayKey = fmtKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  let totSessions = 0,
    totHours = 0,
    totHolidays = 0;
  const weekSet = new Set();
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    const key = fmtKey(year, month, d);
    weekSet.add(Math.floor((d + firstDow - 1) / 7));
    if (holidays[key]) {
      totHolidays++;
    } else if (byDay[dow]) {
      totSessions += byDay[dow].length;
      byDay[dow].forEach((s) => {
        totHours += calcHrs(s.start_time, s.end_time);
      });
    }
  }

  const renderCell = (d, mo) => {
    const key = fmtKey(year, mo, d);
    const dow = new Date(year, mo, d).getDay();
    const isOther = mo !== month;
    const isToday = !isOther && key === todayKey;
    const isHoli = !isOther && !!holidays[key];
    const isTeach = !isOther && !isHoli && dow >= 1 && dow <= 5 && !!byDay[dow];
    const isSel = selKey === key && !isOther;

    let bg = "transparent";
    let numColor = isOther ? "#d0dbd6" : C.ink;
    let border = {};
    if (isToday) {
      bg = "#fffbeb";
      border = { borderWidth: 1.5, borderColor: "#f59e0b" };
      numColor = "#b45309";
    }
    if (isHoli) {
      bg = "#fee2e2";
      numColor = "#b91c1c";
    }
    if (isTeach) {
      bg = "#dcfce7";
      numColor = "#166534";
    }
    if (isSel) {
      bg = C.g500;
      numColor = "#fff";
      border = {};
    }

    const dotCount = isTeach ? Math.min((byDay[dow] || []).length, 3) : 0;
    const dotColor = isSel ? "rgba(255,255,255,0.75)" : C.g700;

    return (
      <TouchableOpacity
        key={`${mo}-${d}`}
        activeOpacity={isOther ? 1 : 0.7}
        onPress={() => {
          if (!isOther) setSelKey(isSel ? null : key);
        }}
        style={[MV.cell, { backgroundColor: bg }, border]}
      >
        <Text style={[MV.num, { color: numColor }]}>{d}</Text>
        <View style={MV.dotsRow}>
          {isTeach &&
            Array.from({ length: dotCount }).map((_, i) => (
              <View key={i} style={[MV.dot, { backgroundColor: dotColor }]} />
            ))}
          {isHoli && !isSel && (
            <View style={[MV.dot, { backgroundColor: "#ef4444" }]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--)
    cells.push(renderCell(daysInPrev - i, month - 1));
  for (let d = 1; d <= daysInMonth; d++) cells.push(renderCell(d, month));
  const rem = (firstDow + daysInMonth) % 7;
  if (rem > 0)
    for (let d = 1; d <= 7 - rem; d++) cells.push(renderCell(d, month + 1));

  const selDate = selKey ? new Date(selKey) : null;
  const selDow = selDate?.getDay();
  const selHoli = selKey ? holidays[selKey] : null;
  const selItems =
    !selHoli && selDow !== undefined ? (byDay[selDow] ?? []) : [];

  return (
    <View>
      <View style={MV.nav}>
        <NavArrow
          dir="left"
          onPress={() => {
            setSelKey(null);
            onChangeMonth(-1);
          }}
        />
        <View style={{ alignItems: "center" }}>
          <Text style={MV.navLabel}>
            {THAI_MONTHS[month]} {year + 543}
          </Text>
          <Text style={MV.navSub}>
            {THAI_MONTHS_SHORT[month]} {year}
          </Text>
        </View>
        <NavArrow
          dir="right"
          onPress={() => {
            setSelKey(null);
            onChangeMonth(1);
          }}
        />
      </View>

      <View style={MV.legend}>
        {[
          { color: "#16a34a", label: "วันสอน" },
          { color: "#ef4444", label: "วันหยุด" },
          { color: "#f59e0b", label: "วันนี้" },
        ].map((l) => (
          <View key={l.label} style={MV.legItem}>
            <View style={[MV.legDot, { backgroundColor: l.color }]} />
            <Text style={MV.legTxt}>{l.label}</Text>
          </View>
        ))}
      </View>

      <View style={MV.dowRow}>
        {DOW_SHORT.map((d, i) => (
          <Text key={d} style={[MV.dow, i === 0 && { color: "#ef4444" }]}>
            {d}
          </Text>
        ))}
      </View>

      <View style={MV.grid}>{cells}</View>

      {selKey && (
        <View style={MV.panel}>
          <Text style={MV.panelDate}>
            {selDate.getDate()} {THAI_MONTHS[selDate.getMonth()]}{" "}
            {selDate.getFullYear() + 543}
            {"  "}
            <Text style={{ color: C.dim, fontWeight: "600" }}>
              ({DOW_FULL[selDow]})
            </Text>
          </Text>
          {selHoli ? (
            <View style={MV.holiBox}>
              <Ionicons name="alert-circle-outline" size={14} color="#b91c1c" />
              <Text style={MV.holiTxt}>{selHoli}</Text>
            </View>
          ) : selItems.length === 0 ? (
            <Text style={MV.panelEmpty}>ไม่มีคาบสอน</Text>
          ) : (
            selItems.map((item) => (
              <View key={item.id} style={MV.panelItem}>
                <View
                  style={[
                    MV.panelBar,
                    {
                      backgroundColor: (C.type[item.type] ?? C.type.lecture)
                        .bar,
                    },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={MV.panelTime}>
                    {item.start_time} – {item.end_time}
                    {"  ·  "}
                    {item.room}
                    {item.group ? "  ·  กลุ่ม " + item.group : ""}
                  </Text>
                  <Text style={MV.panelName}>{item.subject_name}</Text>
                  <Text style={MV.panelCode}>
                    {item.subject_code}
                    {"  ·  "}
                    {calcHrs(item.start_time, item.end_time)} ชม.
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      <View style={MV.statsRow}>
        {[
          { label: "คาบสอน", value: String(totSessions) },
          { label: "ชม.สอน", value: String(Math.round(totHours)) },
          { label: "วันหยุด", value: `${totHolidays} วัน` },
          { label: "สัปดาห์", value: String(weekSet.size) },
        ].map((s) => (
          <View key={s.label} style={MV.statPill}>
            <Text style={MV.statNum}>{s.value}</Text>
            <Text style={MV.statLbl}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const MV = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  navLabel: { fontSize: 15, fontWeight: "800", color: C.ink },
  navSub: { fontSize: 11, color: C.dim, fontWeight: "600", marginTop: 1 },
  legend: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  legItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legDot: { width: 8, height: 8, borderRadius: 3 },
  legTxt: { fontSize: 10, fontWeight: "700", color: C.sub },
  dowRow: { flexDirection: "row", paddingHorizontal: 12 },
  dow: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "800",
    color: C.dim,
    paddingVertical: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    rowGap: 3,
    columnGap: 1,
  },
  cell: {
    width: "14.28%",
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  num: { fontSize: 13, fontWeight: "700" },
  dotsRow: { flexDirection: "row", gap: 2, height: 6, alignItems: "center" },
  dot: { width: 4, height: 4, borderRadius: 2 },
  panel: {
    margin: 12,
    backgroundColor: C.g50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.g100,
    padding: 14,
  },
  panelDate: {
    fontSize: 13,
    fontWeight: "800",
    color: C.g700,
    marginBottom: 10,
  },
  panelEmpty: {
    textAlign: "center",
    color: C.dim,
    fontSize: 12,
    fontWeight: "700",
    paddingVertical: 6,
  },
  panelItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: C.g100,
  },
  panelBar: { width: 4, height: 44, borderRadius: 3, marginTop: 2 },
  panelTime: { fontSize: 10, fontWeight: "800", color: C.g400 },
  panelName: { fontSize: 13, fontWeight: "800", color: C.ink, marginTop: 2 },
  panelCode: { fontSize: 10, color: C.dim, fontWeight: "700", marginTop: 1 },
  holiBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 10,
  },
  holiTxt: { fontSize: 12, fontWeight: "800", color: "#b91c1c" },
  statsRow: { flexDirection: "row", gap: 8, padding: 12 },
  statPill: {
    flex: 1,
    backgroundColor: C.g20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.g100,
    paddingVertical: 10,
    alignItems: "center",
  },
  statNum: { fontSize: 17, fontWeight: "800", color: C.ink },
  statLbl: { fontSize: 9, fontWeight: "700", color: C.dim, marginTop: 2 },
});

// ══════════════════════════════════════════════════════════════
// VIEW: WEEK
// ══════════════════════════════════════════════════════════════
const WeekView = ({ byDay, holidays }) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const getWeekStart = (d) => {
    const s = new Date(d);
    s.setDate(s.getDate() - s.getDay());
    s.setHours(0, 0, 0, 0);
    return s;
  };

  const [weekStart, setWeekStart] = useState(getWeekStart(now));
  const initDow = now.getDay() >= 1 && now.getDay() <= 5 ? now.getDay() : 1;
  const [activeDow, setActiveDow] = useState(initDow);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const shiftWk = (dir) =>
    setWeekStart((s) => {
      const n = new Date(s);
      n.setDate(n.getDate() + dir * 7);
      return n;
    });

  const isToday = (d) => d.toDateString() === now.toDateString();
  const weekdays = days.filter((d) => d.getDay() >= 1 && d.getDay() <= 5);
  const activeDay = days.find((d) => d.getDay() === activeDow);
  const activeKey = activeDay
    ? fmtKey(activeDay.getFullYear(), activeDay.getMonth(), activeDay.getDate())
    : null;
  const activeHoli = activeKey ? holidays[activeKey] : null;
  const items = byDay[activeDow] ?? [];

  return (
    <View style={{ paddingBottom: 16 }}>
      <View style={WV.nav}>
        <NavArrow dir="left" onPress={() => shiftWk(-1)} />
        <Text style={WV.navLabel}>
          {days[1].getDate()} – {days[5].getDate()}{" "}
          {THAI_MONTHS_SHORT[days[5].getMonth()]} {days[5].getFullYear() + 543}
        </Text>
        <NavArrow dir="right" onPress={() => shiftWk(1)} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={WV.tabRow}
      >
        {weekdays.map((d) => {
          const dow = d.getDay();
          const active = activeDow === dow;
          const key = fmtKey(d.getFullYear(), d.getMonth(), d.getDate());
          const hasCls = !!byDay[dow];
          const isHoli = !!holidays[key];
          return (
            <TouchableOpacity
              key={dow}
              style={[WV.tab, active && WV.tabActive]}
              onPress={() => setActiveDow(dow)}
              activeOpacity={0.8}
            >
              <Text style={[WV.tabDow, active && WV.tabWhite]}>
                {DOW_SHORT[dow]}
              </Text>
              <Text style={[WV.tabNum, active && WV.tabWhite]}>
                {d.getDate()}
              </Text>
              {isToday(d) && <View style={WV.todayDot} />}
              {hasCls && !isHoli && (
                <View
                  style={[
                    WV.classDot,
                    active && { backgroundColor: "rgba(255,255,255,0.6)" },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        {activeHoli ? (
          <View style={WV.holiBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#b91c1c" />
            <Text style={WV.holiTxt}>{activeHoli}</Text>
          </View>
        ) : items.length === 0 ? (
          <EmptyDay />
        ) : (
          items.map((item) => {
            const t = C.type[item.type] ?? C.type.lecture;
            return (
              <View key={item.id} style={WV.tlRow}>
                <Text style={WV.tlTime}>{item.start_time}</Text>
                <View style={[WV.tlBlock, { borderLeftColor: t.bar }]}>
                  <View style={[WV.tlBadge, { backgroundColor: t.bg }]}>
                    <Text style={[WV.tlBadgeTxt, { color: t.text }]}>
                      {calcHrs(item.start_time, item.end_time)} ชม.
                    </Text>
                  </View>
                  <Text style={WV.tlName}>{item.subject_name}</Text>
                  <Text style={WV.tlMeta}>
                    {item.subject_code}
                    {"  ·  "}
                    {item.room}
                    {item.group ? "  ·  กลุ่ม " + item.group : ""}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

const WV = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  navLabel: { fontSize: 14, fontWeight: "800", color: C.ink },
  tabRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 2 },
  tab: {
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 52,
  },
  tabActive: {
    backgroundColor: C.g500,
    borderColor: C.g500,
    shadowColor: C.g500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabDow: { fontSize: 9, fontWeight: "800", color: C.dim },
  tabNum: { fontSize: 18, fontWeight: "800", color: C.ink },
  tabWhite: { color: "#fff" },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#f59e0b",
    marginTop: 3,
  },
  classDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.g300,
    marginTop: 3,
  },
  holiBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 14,
  },
  holiTxt: { fontSize: 13, fontWeight: "800", color: "#b91c1c" },
  tlRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  tlTime: {
    width: 40,
    fontSize: 11,
    fontWeight: "700",
    color: C.dim,
    textAlign: "right",
    paddingTop: 14,
  },
  tlBlock: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    borderLeftWidth: 4,
    padding: 12,
  },
  tlBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  tlBadgeTxt: { fontSize: 9, fontWeight: "800" },
  tlName: { fontSize: 13, fontWeight: "800", color: C.ink, marginBottom: 4 },
  tlMeta: { fontSize: 10, fontWeight: "700", color: C.dim },
});

// ══════════════════════════════════════════════════════════════
// VIEW: LIST  (รายวัน — แสดงวันปัจจุบัน + navigate ทีละวัน)
// ══════════════════════════════════════════════════════════════
const ListView = ({ byDay, holidays }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(today);
    const dow = d.getDay();
    if (dow === 0) d.setDate(d.getDate() + 1);
    if (dow === 6) d.setDate(d.getDate() + 2);
    return d;
  });

  const shiftDay = (dir) => {
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + dir);
      const dow = next.getDay();
      if (dow === 6) next.setDate(next.getDate() + (dir > 0 ? 2 : -1));
      if (dow === 0) next.setDate(next.getDate() + (dir > 0 ? 1 : -2));
      return next;
    });
  };

  const isToday = viewDate.toDateString() === today.toDateString();
  const dow = viewDate.getDay();
  const dateKey = fmtKey(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    viewDate.getDate(),
  );
  const isHoliday = !!holidays[dateKey];
  const holidayName = holidays[dateKey];
  const items = byDay[dow] ?? [];
  const totalHrs = items.reduce(
    (acc, s) => acc + calcHrs(s.start_time, s.end_time),
    0,
  );

  return (
    <View style={LV.root}>
      {/* DATE NAVIGATOR */}
      <View style={LV.nav}>
        <NavArrow dir="left" onPress={() => shiftDay(-1)} />
        <TouchableOpacity
          style={LV.navCenter}
          onPress={() => {
            const d = new Date(today);
            const dow = d.getDay();
            if (dow === 6) d.setDate(d.getDate() + 2);
            if (dow === 0) d.setDate(d.getDate() + 1);
            setViewDate(d);
          }}
          activeOpacity={0.75}
        >
          {isToday && (
            <View style={LV.todayPill}>
              <Text style={LV.todayPillTxt}>วันนี้</Text>
            </View>
          )}
          <Text style={LV.navDow}>วัน{DOW_API[dow] ?? DOW_FULL[dow]}</Text>
          <Text style={LV.navDate}>
            {viewDate.getDate()} {THAI_MONTHS[viewDate.getMonth()]}{" "}
            {viewDate.getFullYear() + 543}
          </Text>
        </TouchableOpacity>
        <NavArrow dir="right" onPress={() => shiftDay(1)} />
      </View>

      <View style={LV.divider} />

      {/* SUMMARY STRIP */}
      {items.length > 0 && !isHoliday && (
        <View style={LV.summaryRow}>
          <View style={LV.summaryPill}>
            <Ionicons name="book-outline" size={12} color={C.g700} />
            <Text style={LV.summaryTxt}>{items.length} คาบ</Text>
          </View>
          <View style={LV.summaryPill}>
            <Ionicons name="time-outline" size={12} color={C.g700} />
            <Text style={LV.summaryTxt}>
              {Math.round(totalHrs * 10) / 10} ชม.
            </Text>
          </View>
          {["lecture", "lab", "seminar"].map((t) => {
            const cnt = items.filter((i) => i.type === t).length;
            if (!cnt) return null;
            const tc = C.type[t];
            return (
              <View
                key={t}
                style={[LV.summaryPill, { backgroundColor: tc.bg }]}
              >
                <View style={[LV.summaryDot, { backgroundColor: tc.dot }]} />
                <Text style={[LV.summaryTxt, { color: tc.text }]}>
                  {TYPE_LABEL[t]} {cnt}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* HOLIDAY BANNER */}
      {isHoliday && (
        <View style={LV.holiBanner}>
          <View style={LV.holiIconWrap}>
            <Ionicons name="sunny-outline" size={22} color="#b45309" />
          </View>
          <View>
            <Text style={LV.holiTitle}>วันหยุด</Text>
            <Text style={LV.holiName}>{holidayName}</Text>
          </View>
        </View>
      )}

      {/* TIMELINE */}
      <View style={LV.timeline}>
        {!isHoliday && items.length === 0 && <EmptyDay />}
        {!isHoliday &&
          items.map((item, idx) => {
            const t = C.type[item.type] ?? C.type.lecture;
            const isLast = idx === items.length - 1;
            return (
              <View key={item.id} style={LV.tlRow}>
                <View style={LV.tlTimeCol}>
                  <Text style={LV.tlStart}>{item.start_time}</Text>
                  {!isLast && <View style={LV.tlLine} />}
                  <Text style={LV.tlEnd}>{item.end_time}</Text>
                </View>
                <View style={[LV.tlCard, { borderLeftColor: t.bar }]}>
                  <View style={LV.tlTop}>
                    <TypeBadge type={item.type} />
                    <View style={LV.tlDurPill}>
                      <Ionicons
                        name="hourglass-outline"
                        size={10}
                        color={C.dim}
                      />
                      <Text style={LV.tlDurTxt}>
                        {calcHrs(item.start_time, item.end_time)} ชม.
                      </Text>
                    </View>
                  </View>
                  <Text style={LV.tlCode}>{item.subject_code}</Text>
                  <Text style={LV.tlName}>{item.subject_name}</Text>
                  <View style={LV.tlChips}>
                    {!!item.room && (
                      <View style={LV.tlChip}>
                        <Ionicons
                          name="location-outline"
                          size={11}
                          color={C.dim}
                        />
                        <Text style={LV.tlChipTxt}>{item.room}</Text>
                      </View>
                    )}
                    {!!item.group && (
                      <View style={LV.tlChip}>
                        <Ionicons
                          name="people-outline"
                          size={11}
                          color={C.dim}
                        />
                        <Text style={LV.tlChipTxt}>กลุ่ม {item.group}</Text>
                      </View>
                    )}
                    {item.student_count > 0 && (
                      <View style={LV.tlChip}>
                        <Ionicons
                          name="person-outline"
                          size={11}
                          color={C.dim}
                        />
                        <Text style={LV.tlChipTxt}>
                          {item.student_count} คน
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
      </View>
    </View>
  );
};

// LV styles — ต้องอยู่หลัง ListView และก่อน export default
const LV = StyleSheet.create({
  root: { paddingBottom: 8 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  navCenter: { alignItems: "center", flex: 1, marginHorizontal: 8 },
  navDow: { fontSize: 16, fontWeight: "800", color: C.ink, marginTop: 2 },
  navDate: { fontSize: 12, color: C.dim, fontWeight: "600", marginTop: 2 },
  todayPill: {
    backgroundColor: C.g500,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 4,
  },
  todayPillTxt: { color: "#fff", fontSize: 10, fontWeight: "800" },
  divider: { height: 1, backgroundColor: C.line, marginHorizontal: 16 },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.g50,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.g100,
  },
  summaryDot: { width: 6, height: 6, borderRadius: 3 },
  summaryTxt: { fontSize: 11, fontWeight: "700", color: C.g700 },
  holiBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fed7aa",
    padding: 16,
  },
  holiIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffedd5",
    alignItems: "center",
    justifyContent: "center",
  },
  holiTitle: { fontSize: 11, fontWeight: "700", color: "#b45309" },
  holiName: { fontSize: 15, fontWeight: "800", color: "#7c2d12", marginTop: 2 },
  timeline: { paddingHorizontal: 16, paddingTop: 14 },
  tlRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  tlTimeCol: { width: 44, alignItems: "flex-end", paddingTop: 4 },
  tlStart: {
    fontSize: 11,
    fontWeight: "800",
    color: C.g500,
    letterSpacing: 0.2,
  },
  tlEnd: { fontSize: 10, fontWeight: "700", color: C.dim, marginTop: 4 },
  tlLine: {
    width: 1,
    flex: 1,
    backgroundColor: C.g100,
    alignSelf: "center",
    marginVertical: 4,
    minHeight: 16,
  },
  tlCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    borderLeftWidth: 4,
    padding: 13,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tlTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  tlDurPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.g20,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tlDurTxt: { fontSize: 10, fontWeight: "700", color: C.dim },
  tlCode: {
    fontSize: 10,
    fontWeight: "800",
    color: C.g300,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  tlName: {
    fontSize: 15,
    fontWeight: "900",
    color: C.ink,
    lineHeight: 21,
    marginBottom: 9,
  },
  tlChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tlChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.g20,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tlChipTxt: { fontSize: 11, fontWeight: "700", color: C.sub },
});

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function Schedulepage() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [schedule, setSchedule] = useState([]);
  const [holidays, setHolidays] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("month");

  const todayDate = new Date();
  const [calYear, setCalYear] = useState(todayDate.getFullYear());
  const [calMonth, setCalMonth] = useState(todayDate.getMonth());

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ── MOCK (ลบเมื่อ API พร้อม) ──────────────────────────────
      const rawSchedule = MOCK_SCHEDULE;
      const rawHolidays = MOCK_HOLIDAYS;

      // ── API จริง (uncomment เมื่อ API พร้อม) ─────────────────
      // const [schJson, holJson] = await Promise.all([
      //   apiFetch(ENDPOINTS.schedule),
      //   apiFetch(ENDPOINTS.holidays, { semester: 1, year: 2568 }),
      // ]);
      // const rawSchedule = schJson.data ?? schJson;
      // const rawHolidays = holJson.data ?? holJson;

      setSchedule(
        normalizeSchedule(Array.isArray(rawSchedule) ? rawSchedule : []),
      );
      setHolidays(
        normalizeHolidays(Array.isArray(rawHolidays) ? rawHolidays : []),
      );
    } catch (e) {
      console.warn("Schedule fetch error:", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 9,
      }).start();
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const byDay = groupByDay(schedule);

  const handleChangeMonth = (dir) => {
    setCalMonth((m) => {
      const nm = m + dir;
      if (nm > 11) {
        setCalYear((y) => y + 1);
        return 0;
      }
      if (nm < 0) {
        setCalYear((y) => y - 1);
        return 11;
      }
      return nm;
    });
  };

  return (
    <SafeAreaView style={P.screen}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient
        colors={HDR_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={P.header}
      >
        <View style={P.hdrRow}>
          <TouchableOpacity
            style={P.circleBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={P.hdrTitle}>ตารางสอน</Text>
            <Text style={P.hdrSub}>ภาคเรียนที่ 1/2568</Text>
          </View>
          <View style={P.circleBtn}>
            <Text style={P.avatarTxt}>อจ</Text>
          </View>
        </View>

        <View style={P.toggleWrap}>
          {VIEWS.map((v) => {
            const active = activeView === v.key;
            return (
              <TouchableOpacity
                key={v.key}
                style={[P.toggleBtn, active && P.toggleBtnActive]}
                onPress={() => setActiveView(v.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={active ? v.iconActive : v.icon}
                  size={14}
                  color={active ? C.g700 : "rgba(255,255,255,0.8)"}
                />
                <Text style={[P.toggleTxt, active && P.toggleTxtActive]}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* ERROR */}
      {error && (
        <View style={P.errBanner}>
          <Ionicons name="wifi-outline" size={14} color={C.gold} />
          <Text style={P.errTxt}>ไม่สามารถเชื่อมต่อ – แสดงข้อมูลสำรอง</Text>
        </View>
      )}

      {/* LOADING / CONTENT */}
      {loading ? (
        <View style={P.loadWrap}>
          <ActivityIndicator size="large" color={C.g500} />
          <Text style={P.loadTxt}>กำลังโหลดตารางสอน…</Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={{ flex: 1, opacity: fadeAnim }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          <View style={P.viewCard}>
            {activeView === "month" && (
              <MonthView
                year={calYear}
                month={calMonth}
                byDay={byDay}
                holidays={holidays}
                onChangeMonth={handleChangeMonth}
              />
            )}
            {activeView === "week" && (
              <WeekView byDay={byDay} holidays={holidays} />
            )}
            {/* ✅ ส่ง holidays prop ด้วย */}
            {activeView === "list" && (
              <ListView byDay={byDay} holidays={holidays} />
            )}
          </View>
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGE STYLES
// ══════════════════════════════════════════════════════════════
const P = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  hdrRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  hdrTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  hdrSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  avatarTxt: { color: "#fff", fontSize: 11, fontWeight: "900" },
  toggleWrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 11,
  },
  toggleBtnActive: { backgroundColor: "#fff" },
  toggleTxt: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "700",
  },
  toggleTxtActive: { color: C.g700 },
  errBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fffbea",
    borderBottomWidth: 1,
    borderBottomColor: "#f5e09a",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errTxt: { color: "#7a5e00", fontSize: 12, fontWeight: "700" },
  loadWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadTxt: { color: C.dim, fontSize: 13, fontWeight: "700" },
  viewCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.line,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
});
