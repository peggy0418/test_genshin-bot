<template>
  <div class="bg-slate-800 rounded-xl p-4 shadow-md space-y-3">
    <ul>
      <li v-for="(task, i) in tasks" :key="i"
          class="flex gap-3 items-center bg-slate-700/60 p-3 rounded-lg transition-colors duration-200 hover:bg-slate-700">
        <input type="checkbox" v-model="task.done" class="accent-yellow-400 w-5 h-5 transition-colors"/>
        <span :class="task.done ? 'line-through text-gray-400 transition-all duration-300' : ''">
          {{ task.text }}
        </span>
      </li>
    </ul>

    <button @click="$emit('clear-today')" class="mt-3 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition-colors">
      清除今天任務
    </button>
  </div>
</template>

<script setup>
defineProps({
  tasks: Array
});
</script>
