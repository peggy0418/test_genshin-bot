<template>
  <div class="min-h-screen bg-slate-900 text-white flex justify-center p-4">
    <div class="w-full max-w-full space-y-6">
      <!-- 標題 & 日期 -->
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-1">🎮 原神每日任務</h1>
        <p class="text-gray-400">{{ today }}</p>
        <p class="text-sm text-amber-400 mt-1">⏳ 距離每日重置還有 {{ countdown }}</p>
      </div>

      <!-- 今日素材 -->
      <TodayMaterials :todayMaterials="todayMaterials" />

      <!-- 任務清單 -->
      <TaskList :tasks="tasks" @clear-today="clearToday" />

      <!-- 本週行事曆 -->
      <WeekCalendar :weekDays="weekDays" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import TaskList from "./components/TaskList.vue";
import WeekCalendar from "./components/WeekCalendar.vue";
import TodayMaterials from "./components/TodayMaterials.vue";

// 每日素材副本
const DOMAIN_MATERIALS = {
  1: { talent: "自由 / 繁榮 / 浮世 / 公平", weapon: "孤王 / 孤雲 / 遠海 / 古海" },
  2: { talent: "抗爭 / 勤勞 / 風雅 / 正義", weapon: "奔狼 / 霧海 / 鳴神 / 聖露" },
  3: { talent: "詩文 / 黃金 / 天光 / 秩序", weapon: "獅牙 / 隕鐵 / 鬼人 / 異界" },
  4: { talent: "自由 / 繁榮 / 浮世 / 公平", weapon: "孤王 / 孤雲 / 遠海 / 古海" },
  5: { talent: "抗爭 / 勤勞 / 風雅 / 正義", weapon: "奔狼 / 霧海 / 鳴神 / 聖露" },
  6: { talent: "詩文 / 黃金 / 天光 / 秩序", weapon: "獅牙 / 隕鐵 / 鬼人 / 異界" },
  0: { talent: "全部天賦書開放", weapon: "全部武器素材開放" },
};

const GAME_RESET_HOUR = 4;
const gameDate = ref(new Date());
const weekStartDate = ref("");

const calcGameDate = () => {
  const now = new Date();
  const d = new Date(now);

  if (now.getHours() < GAME_RESET_HOUR) {
    d.setDate(d.getDate() - 1);
  }

  gameDate.value = d;
};

const todayDate = computed(() => gameDate.value);
const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const today = computed(() => formatLocalDate(todayDate.value));
const storage = ref({});
const tasks = ref([]);

const todayMaterials = computed(() => {
  return DOMAIN_MATERIALS[todayDate.value.getDay()];
});
const countdown = ref("");

const defaultTasks = () => {
  const m = todayMaterials.value;
  return [
    "每日委託（4 次）/ 消耗體力120體",
    "領取每日獎勵",
    "消耗原粹樹脂",
    "派遣角色",
    `刷素材（天賦：${m.talent}｜武器：${m.weapon}）`,
  ].map((t) => ({ text: t, done: false }));
};

const updateMaterialTask = () => {
  const m = todayMaterials.value;
  const text = `刷素材（天賦：${m.talent}｜武器：${m.weapon}）`;
  const index = tasks.value.findIndex((t) => t.text.startsWith("刷素材"));
  if (index !== -1) tasks.value[index].text = text;
};
const calcNextResetTime = () => {
  const now = new Date();
  const next = new Date(now);

  next.setHours(GAME_RESET_HOUR, 0, 0, 0);

  // 如果現在已經過 4:00，目標改成明天 4:00
  if (now >= next) {
    next.setDate(next.getDate() + 1);
  }

  return next;
};
const updateCountdown = () => {
  const now = new Date();
  const nextReset = calcNextResetTime();
  const diff = nextReset - now;

  if (diff <= 0) {
    countdown.value = "00:00:00";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  countdown.value = `${h}:${m}:${s}`;
};
onMounted(() => {
  calcGameDate();

  // 讀取每週起始日
  const savedWeekStart = localStorage.getItem("genshin-week-start");

  const currentWeekStart = calcWeekStart();

  if (savedWeekStart !== currentWeekStart) {
    // 代表進入新的一週（只會在週一 4:00 發生）
    localStorage.setItem("genshin-week-start", currentWeekStart);
    weekStartDate.value = currentWeekStart;
  } else {
    weekStartDate.value = savedWeekStart;
  }

  storage.value = JSON.parse(localStorage.getItem("genshin-calendar") || "{}");
  tasks.value = storage.value[today.value] || defaultTasks();
  updateMaterialTask();

  startAutoRefresh();
});

watch(
  tasks,
  () => {
    storage.value[today.value] = tasks.value;
    localStorage.setItem("genshin-calendar", JSON.stringify(storage.value));
  },
  { deep: true }
);
const calcWeekStart = () => {
  const d = new Date(gameDate.value);

  // 回到本週星期日
  d.setDate(d.getDate() - d.getDay());

  return formatLocalDate(d);
};
const weekDays = computed(() => {
  if (!weekStartDate.value) return [];

  const start = new Date(weekStartDate.value);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const date = formatLocalDate(d);

    return {
      label: ["日", "一", "二", "三", "四", "五", "六"][i],
      date,
      isToday: date === today.value,
      doneTasks: (storage.value[date] || []).filter((t) => t.done),
    };
  });
});

const clearToday = () => {
  tasks.value = defaultTasks();
};

let timer = null;

const startAutoRefresh = () => {
  updateCountdown();

  timer = setInterval(() => {
    const oldDay = today.value;

    calcGameDate();
    updateCountdown();

    // 4:00 換日
    if (today.value !== oldDay) {
      tasks.value = storage.value[today.value] || defaultTasks();
      updateMaterialTask();

      // 檢查是否進入新的一週
      const newWeekStart = calcWeekStart();
      if (newWeekStart !== weekStartDate.value) {
        weekStartDate.value = newWeekStart;
        localStorage.setItem("genshin-week-start", newWeekStart);
      }
    }
  }, 1000); // 每秒更新倒數
};
</script>
