<template>
  <div class="anime">
    <img :src="anime.image" alt=""/>
    <div class="anime-content">
      <h3>{{anime.title}}</h3>
      <div class="anime-controls">
        <span class="episodes">
          {{anime.watched_episodes}} / {{anime.total_episodes}}
        </span>
        <div class="button-group">
          <button v-if="anime.total_episodes !== anime.watched_episodes"
              class="button"
              @click="$emit('increase')"
              @mousedown="startRepeating('increase')"
              @mouseup="stopRepeating"
              @mouseleave="stopRepeating"
              @touchstart.prevent="startRepeating('increase')"
              @touchend="stopRepeating"
              @touchcancel="stopRepeating">+</button>
          <button v-if="anime.watched_episodes > 0"
              class="button"
              @click="$emit('decrease')"
              @mousedown="startRepeating('decrease')"
              @mouseup="stopRepeating"
              @mouseleave="stopRepeating"
              @touchstart.prevent="startRepeating('decrease')"
              @touchend="stopRepeating"
              @touchcancel="stopRepeating">-</button>
          <button class="button delete-button" @click="$emit('delete')">x</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  anime: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['increase', 'decrease', 'delete']);

// Timer-Variablen für das Gedrückthalten
const repeatTimer = ref(null);
const repeatDelay = ref(null);

// Startet das wiederholte Auslösen von Events beim Gedrückthalten
const startRepeating = (action) => {
  // Erstes Event sofort auslösen
  emit(action);

  // Nach einer kurzen Verzögerung beginnen, regelmäßig Events auszulösen
  repeatDelay.value = setTimeout(() => {
    repeatTimer.value = setInterval(() => {
      emit(action);
    }, 100); // Alle 100ms ein Event auslösen
  }, 500); // Nach 500ms mit dem schnellen Wiederholen beginnen
};

// Stoppt das wiederholte Auslösen beim Loslassen
const stopRepeating = () => {
  if (repeatDelay.value) {
    clearTimeout(repeatDelay.value);
    repeatDelay.value = null;
  }
  if (repeatTimer.value) {
    clearInterval(repeatTimer.value);
    repeatTimer.value = null;
  }
};
</script>

<style scoped>
.anime {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  background-color: #FFF;
  padding: 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.anime:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.anime img {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-right: 0.75rem;
}

.anime-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.anime h3 {
  color: #333;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.anime-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.episodes {
  font-size: 0.9rem;
  background-color: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: #555;
}

.button-group {
  display: flex;
  gap: 0.25rem;
}

.button {
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  min-width: 2rem;
}

.delete-button {
  background-image: linear-gradient(to right, #ff5252 50%, #d32f2f 50%);
}
</style>
