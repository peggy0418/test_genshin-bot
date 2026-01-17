<template>
  <div class="min-h-screen bg-slate-900 text-white flex justify-center p-4">
    <div class="w-full max-w-full space-y-6">
      <!-- 標題 & 日期 -->
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-1">🎮 原神每日任務</h1>
        <p class="text-gray-400">{{ today }}</p>
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

onMounted(() => {
  storage.value = JSON.parse(localStorage.getItem("genshin-calendar") || "{}");
  tasks.value = storage.value[today] || defaultTasks();
  updateMaterialTask();
});

onMounted(() => {
  calcGameDate();

  storage.value = JSON.parse(localStorage.getItem("genshin-calendar") || "{}");
  tasks.value = storage.value[today.value] || defaultTasks();
  updateMaterialTask();

  startAutoRefresh();
});

watch(
  tasks,
  () => {
    storage.value[today] = tasks.value;
    localStorage.setItem("genshin-calendar", JSON.stringify(storage.value));
  },
  { deep: true }
);

const weekDays = computed(() => {
  const start = new Date(todayDate.value);
  start.setDate(start.getDate() - start.getDay());

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
  timer = setInterval(() => {
    const oldDay = today.value;
    calcGameDate();

    // 換日了
    if (today.value !== oldDay) {
      tasks.value = storage.value[today.value] || defaultTasks();
      updateMaterialTask();
    }
  }, 60 * 1000); // 每分鐘檢查一次就夠
};
</script>
