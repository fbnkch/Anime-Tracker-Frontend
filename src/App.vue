<template>
  <main>
    <h1>Anime Tracker</h1>

    <form @submit.prevent="searchAnime">
      <input type="text" placeholder="Suche nach einem Anime..."
      v-model="eingabe" @input="handleEingabe"/>
      <button type="submit" class="button">Suchen</button>
    </form>

    <div class="results" v-if="search_results.length > 0">
      <div class="result" v-for="anime in search_results">
        <img :src="anime.images.jpg.image_url" alt=""/>
        <div class="details">
          <h3>{{anime.title}}</h3>
          <p :title="anime.synopsis" v-if="anime.synopsis">
             {{anime.synopsis.slice(0,150)}}...</p>
          <span class="flex-1"></span>
          <button @click="addAnime(anime)"
          class="button">Zu meinen Anime hinzufügen</button>
        </div>
      </div>
    </div>

    <div class="myanime" v-if="my_anime.length > 0">
      <h2>Meine Anime</h2>
      <AnimeItem
        v-for="anime in my_anime_asc"
        :key="anime.id"
        :anime="anime"
        @increase="increaseEpisode(anime)"
        @decrease="decreaseEpisode(anime)"
        @delete="removeAnime(anime)"
      />
    </div>
  </main>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import AnimeItem from '@/components/AnimeItem.vue'

const eingabe = ref('')
const my_anime = ref([])
const search_results = ref([])
const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://animetracker-kzuw.onrender.com/api/animes'
  : 'http://localhost:8080/api/animes';

const USER_ID = '1'

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

  const animeToAdd ={
    id: anime.mal_id,
    title: anime.title,
    image: anime.images.jpg.image_url,
    total_episodes: anime.episodes,
    watched_episodes: 0
  }

  // Backend-Aufruf zum Speichern des Anime
  fetch(`${BACKEND_URL}/user/${USER_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(animeToAdd)
  })
    .then(response => response.json())
    .then(savedAnime => {
      // Verwende die Daten aus dem Backend (mit der korrekten ID)
      my_anime.value.push({
        id: savedAnime.id, // Verwende die vom Backend generierte ID
        title: savedAnime.title,
        image: savedAnime.imageUrl,
        total_episodes: savedAnime.totalEpisodes,
        watched_episodes: savedAnime.watchedEpisodes
      })
    })
    .catch(error => {
      console.error('Fehler beim Speichern des Anime:', error)
      // Fallback zur localStorage, falls der Backend-Aufruf fehlschlägt
      my_anime.value.push(animeToAdd)
      localStorage.setItem('my_anime', JSON.stringify(my_anime.value))
    })
}

const removeAnime = anime => {
  // Backend-Aufruf zum Löschen des Anime
  fetch(`${BACKEND_URL}/user/${USER_ID}/anime/${anime.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(response => {
      if (response.ok) {
        // Nur wenn Backend-Löschung erfolgreich war, entferne aus lokalem Array
        my_anime.value = my_anime.value.filter(a => a.id !== anime.id)
      } else {
        console.error('Fehler beim Löschen des Anime. Status:', response.status)
      }
    })
    .catch(error => {
      console.error('Fehler beim Löschen des Anime:', error)
    })

  // Aktualisiere local storage
  localStorage.setItem('my_anime', JSON.stringify(my_anime.value))
}

const increaseEpisode = anime => {
  // Erhöhen des lokalen Zählers
  anime.watched_episodes++

  // Backend-Aufruf zum Aktualisieren des Anime
  updateAnimeEpisodes(anime)

  // Aktualisiere local storage
  localStorage.setItem('my_anime', JSON.stringify(my_anime.value))
}

const decreaseEpisode = anime => {
  // Verringern des lokalen Zählers (nicht unter 0)
  if (anime.watched_episodes > 0) {
    anime.watched_episodes--

    // Backend-Aufruf zum Aktualisieren des Anime
    updateAnimeEpisodes(anime)

    // Aktualisiere local storage
    localStorage.setItem('my_anime', JSON.stringify(my_anime.value))
  }
}

// Hilsfunktion zum Aktualisieren der watched_episodes
const updateAnimeEpisodes = (anime) => {
  fetch(`${BACKEND_URL}/user/${USER_ID}/anime/${anime.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: anime.id,
      title: anime.title,
      image: anime.image,
      total_episodes: anime.total_episodes,
      watched_episodes: anime.watched_episodes
    })
  })
  .then(response => {
    if (!response.ok) {
      console.error('Fehler beim Aktualisieren der Episoden. Status:', response.status)
    }
  })
  .catch(error => {
    console.error('Fehler beim Aktualisieren der Episoden:', error)
  })
}

onMounted(() => {
  // Versuchen Sie, die Anime vom Backend zu laden
  fetch(`${BACKEND_URL}/user/${USER_ID}`)
    .then(response => response.json())
    .then(data => {
      // Konvertieren der Backend-Daten in das Frontend-Format
      my_anime.value = data.map(anime => ({
        id: anime.id,
        title: anime.title,
        image: anime.imageUrl,  // Backend sendet imageUrl, Frontend erwartet image
        total_episodes: anime.totalEpisodes,
        watched_episodes: anime.watchedEpisodes
      }))
    })
    .catch(error => {
      console.error('Fehler beim Laden der Anime vom Backend:', error)
      // Fallback zur localStorage, falls der Backend-Aufruf fehlschlägt
      my_anime.value = JSON.parse(localStorage.getItem('my_anime')) || []
    })
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Indie Flower', cursive;
}

body{
  background-color: #EEE;
}

main{
  margin: 0 auto;
  max-width: 768px;
  padding: 1.5rem;
}

h1{
  text-align: center;
  margin-bottom: 1.5rem;
  font-family: 'Press Start 2P', cursive;
}

h2{
  font-family: 'Press Start 2P', cursive;
}

form{
  display: flex;
  max-width: 480px;
  margin: 0 auto 1.5rem;
}

form input{
  appearance: none;
  outline: none;
  border: none;
  background: white;

  display: block;
  color: #888;
  font-size: 1.125rem;
  padding: 0.5rem 1rem;
  width: 100%;
}

.button {
  appearance: none;
  outline: none;
  border: none;
  cursor: pointer;

  display: block;
  padding: 0.5rem 1rem;
  background-image: linear-gradient(to right, deeppink 50%, darkviolet 50%);
  background-size: 200%;
  color: white;
  font-size: 1.125rem;
  font-weight: 700;
  text-transform: uppercase;
  transition: .4s;
}

.button:hover{
  background-position: right;
}

.results{
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 480px;
  overflow-y: scroll;
  margin-bottom: 1.5rem;
}

.result{
  display: flex;
  margin: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  transition: .4s;
}

.result img{
  width: 100px;
  border-radius: 1rem;
  margin-right: 1rem;
}

.details {
  flex: 1 1 0;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.flex-1{
  flex: 1 1 0;
}

.details h3{
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.details p{
  font-size: .875rem;
  line-height: 1.4;
  margin-bottom: .5rem;
}

.details .button{
  margin-left: auto;
}

.myanime h2{
  color: #888;
  font-weight: 400;
  margin-bottom: 1.5rem;
}

.myanime .anime{
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  background-color: #FFF;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.anime img{
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 1rem;
  margin-right: 1rem;
}

.anime h3{
  color: #888;
  font-size: 1.125rem;
}

.anime .episodes{
  margin-right: 1rem;
  color: #888;
}

.anime .button:first-of-type{
  margin-right: 1rem;
}

.anime .button:nth-of-type(2){
  margin-right: 1rem;
}

.anime .button:last-of-type{
  margin-right: 0;
}
</style>
