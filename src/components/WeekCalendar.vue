<template>
  <div class="bg-slate-800 rounded-xl p-4 shadow-md">
    <h2 class="text-center font-bold mb-2">📅 本週任務紀錄</h2>
    <div class="grid grid-cols-3 lg:grid-cols-7 gap-2 text-[10px]">
      <div
        v-for="day in weekDays"
        :key="day.date"
        class="p-2 rounded-lg bg-slate-700 relative"
        :class="day.isToday ? 'ring-2 ring-yellow-400' : ''"
        :title="
          day.doneTasks.length
            ? day.doneTasks.map((t) => t.text).join(', ')
            : '尚無完成任務'
        "
      >
        <div class="text-center font-bold">{{ day.label }}</div>
        <ul class="mt-1 space-y-0.5">
          <li
            v-for="(t, i) in day.doneTasks"
            :key="i"
            class="text-ellipsis text-yellow-300"
          >
            ✔ {{ t.text }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  weekDays: Array,
});
</script>
