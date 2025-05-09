<template>
  <div class="anime">
    <img :src="anime.image" alt=""/>
    <h3>{{anime.title}}</h3>
    <div class="flex-1"></div>
    <span class="episodes">
      {{anime.watched_episodes}} / {{anime.total_episodes}}
    </span>
    <button v-if="anime.total_episodes !== anime.watched_episodes"
            class="button"
            @click="$emit('increase')">+</button>
    <button v-if="anime.watched_episodes > 0"
            class="button"
            @click="$emit('decrease')">-</button>
    <button class="button" @click="$emit('delete')">x</button>
  </div>
</template>

<script setup>
defineProps({
  anime: {
    type: Object,
    required: true
  }
})
</script>
