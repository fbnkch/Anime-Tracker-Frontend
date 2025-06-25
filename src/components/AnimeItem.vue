<template>
  <div class="anime">
    <img :src="anime.image" alt=""/>
    <div class="anime-content">
      <h3>
      {{anime.title}}
      <span class="title-favorite" v-if="anime.is_favorite">★</span>
      </h3>
      <div class="anime-controls">
        <span class="episodes">
          {{anime.watched_episodes}} / {{anime.total_episodes}}
        </span>
        <div class="button-group">
          <button
            class="button favorite-button"
            :class="{ active: anime.is_favorite }"
            @click="handleFavoriteClick">
            ★
          </button>
          <button v-if="anime.watched_episodes > 0"
                  class="button"
                  :disabled="isDebouncing"
                  @click="handleDecrease"
                  @mousedown="startLongPress('decrease')"
                  @mouseup="stopLongPress"
                  @mouseleave="stopLongPress"
                  @touchstart.prevent="startLongPress('decrease')"
                  @touchend="stopLongPress"
                  @touchcancel="stopLongPress">-</button>
          <button v-if="anime.total_episodes !== anime.watched_episodes"
                  class="button"
                  :disabled="isDebouncing"
                  @click="handleIncrease"
                  @mousedown="startLongPress('increase')"
                  @mouseup="stopLongPress"
                  @mouseleave="stopLongPress"
                  @touchstart.prevent="startLongPress('increase')"
                  @touchend="stopLongPress"
                  @touchcancel="stopLongPress">+</button>
          <button class="button delete-button"
                  @click="$emit('delete')">x</button>
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

const emit = defineEmits(['increase', 'decrease', 'delete', 'toggle-favorite']);

//Debounce-Status und Timer-IDs
const isDebouncing = ref(false)
const longPressTimer = ref(null)
const repeatTimer = ref(null)
const longPressDelay = 500
const repeatDelay = 100
const debounceDelay = 300

const handleIncrease = () => {
  if (isDebouncing.value) return
  isDebouncing.value = true
  emit('increase')

  setTimeout(() => {
    isDebouncing.value = false
  }, debounceDelay)
}

const handleDecrease = () => {
  if (isDebouncing.value) return
  isDebouncing.value = true
  emit('decrease')

  setTimeout(() => {
    isDebouncing.value = false
  }, debounceDelay)
}

const handleFavoriteClick = () => {
  if (isDebouncing.value) return
  isDebouncing.value = true
  emit('toggle-favorite')

  setTimeout(() => {
    isDebouncing.value = false
  }, debounceDelay)
}

// Funktionen für langes Drücken und Wiederholung
const startLongPress = (action) => {
  // Bestehende Timer löschen
  stopLongPress()

  // Timer für langes Drücken starten
  longPressTimer.value = setTimeout(() => {
    // Erst nach Verzögerung mit Wiederholung beginnen
    repeatAction(action)
  }, longPressDelay)
}

const repeatAction = (action) => {
  if (action === 'increase') {
    emit('increase')
  } else if (action === 'decrease') {
    emit('decrease')
  }

  // Regelmäßige Wiederholung einrichten
  repeatTimer.value = setTimeout(() => {
    repeatAction(action)
  }, repeatDelay)
}

const stopLongPress = () => {
  // Alle Timer aufräumen
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }

  if (repeatTimer.value) {
    clearTimeout(repeatTimer.value)
    repeatTimer.value = null
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

.favorite-button {
  color: #ccc;
  transition: color 0.3s, transform 0.3s;
  font-size: 1.2rem;
}

.favorite-button.active {
  color: gold;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.7);
}

.favorite-button:hover {
  transform: scale(1.2);
}
</style>
