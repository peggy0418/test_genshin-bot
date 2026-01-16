<template>
  <div class="bg-yellow-600/20 p-4 rounded-xl shadow-md">
    <h2 class="font-bold mb-2">🧭 今日素材副本</h2>
    <p>天賦：{{ todayMaterials.talent }}</p>
    <p>武器：{{ todayMaterials.weapon }}</p>
  </div>
</template>

<script setup>
defineProps({
  todayMaterials: Object
});
</script>
