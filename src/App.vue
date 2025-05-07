<template>
  <main>
    <h1>Anime Tracker</h1>

    <form @submit.prevent="searchAnime">
      <input type="text" placeholder="Suche nach einem Anime..."
      v-model="eingabe" @input="handleEingabe"/>
      <button type="submit">Suchen</button>
    </form>

    <div class="results" v-if="search_results.length > 0">
      <div class="result" v-for="anime in search_results">
        <img :src="anime.images.jpg.image_url" alt=""/>
        <div class="details">
          <h3>{{anime.title}}</h3>
          <p :title="anime.synopsis" v-if="anime.synopsis">
             {{anime.synopsis.slice(0,150)}}...</p>
          <span class="flex-1"></span>
          <button @click="addAnime(anime)">Zu meinen Anime hinzufügen</button>
        </div>
      </div>
    </div>

    <div class="myanime" v-if="my_anime.length > 0">
      <h2>Meine Anime</h2>

      <div v-for="anime in my_anime_asc" class="anime">
        <img :src="anime.image" alt=""/>
        <h3>{{anime.title}}</h3>
        <div class="flex-1"></div>
        <span class="episodes">
          {{anime.watched_episodes}} / {{anime.total_episodes}}
        </span>
      </div>
    </div>
  </main>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'

const eingabe = ref('')
const my_anime = ref([])
const search_results = ref([])

//sortieren in dem neue eingabe mit alten werten verglichen wird
const my_anime_asc = computed(() => {
  return my_anime.value.sort((a, b) => {
    return a.title.localeCompare(b.title)
  })
})

const searchAnime = () => {
  const url = `https://api.jikan.moe/v4/anime?q=${eingabe.value}`
  fetch(url)
    .then(response => response.json())
    .then(response => {
      search_results.value = response.data
    })
}

const handleEingabe = e => {
  if (!e.target.value){
    search_results.value = []
  }
}

const addAnime = anime => {
  search_results.value = []
  eingabe.value = ''

  my_anime.value.push({
    id: anime.mal_id,
    title: anime.title,
    image: anime.images.jpg.image_url,
    total_episodes: anime.episodes,
    watched_episodes: 0
  })

  localStorage.setItem('my_anime', JSON.stringify(my_anime.value))
}

const increaseEpisode = anime => {
  anime.watched_episodes++
  localStorage.setItem('my_anime', JSON.stringify(my_anime.value))
}

const decreaseEpisode = anime =>{
  anime.watched_episodes--
  localStorage.setItem('my_anime', JSON.stringify(my_anime.value))
}

onMounted(() =>{
  my_anime.value = JSON.parse(localStorage.getItem('my_anime')) || []
})
</script>

<style>
</style>
