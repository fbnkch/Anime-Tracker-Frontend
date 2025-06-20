<template>
  <header>
    <h1>Anime Tracker</h1>
    <div v-if="currentUser" class="user-info">
      <p>Angemeldet als: {{ currentUser.username }}</p>
      <button @click="logout" class="button">Abmelden</button>
    </div>
  </header>

  <main>
    <AuthForm
      v-if="!currentUser"
      :onLogin="loginUser"
      :onRegister="registerUser"
    />

    <div v-else>
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
              {{anime.synopsis}}
            </p>
            <span class="flex-1"></span>
            <button @click="addAnime(anime)"
                    class="button">Hinzufügen</button>
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
          @toggle-favorite="toggleFavorite(anime)"
        />
      </div>
    </div>
  </main>
  <footer>
    <p>Anime Tracker | Der einfachste Weg deinen Anime-Progress zu verfolgen!</p>
  </footer>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import AnimeItem from '@/components/AnimeItem.vue'
import AuthForm from '@/components/AuthForm.vue'

const eingabe = ref('')
const my_anime = ref([])
const search_results = ref([])
const currentUser = ref(null)
const userFavorites = ref([])
const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://animetracker-kzuw.onrender.com/api'
  : 'http://localhost:8080/api';

// Login-Funktion
const loginUser = (usernameValue) => {
  fetch(`${BACKEND_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: usernameValue })
  })
    .then(response => {
      if (response.ok) {
        return response.json()
      }
      throw new Error('Benutzer nicht gefunden')
    })
    .then(data => {
      currentUser.value = {
        id: data.id,
        username: data.username
      }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      loadUserAnime()
    })
    .catch(error => {
      console.error('Fehler beim Login:', error)
      alert('Benutzer nicht gefunden. Bitte registriere dich zuerst.')
    })
}

// Registrierungs-Funktion
const registerUser = (usernameValue) => {
  fetch(`${BACKEND_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: usernameValue })
  })
    .then(response => {
      if (response.ok) {
        return response.json()
      }
      throw new Error('Fehler bei der Registrierung. Der Benutzername könnte bereits vergeben sein.')
    })
    .then(data => {
      currentUser.value = {
        id: data.id,
        username: data.username
      }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      loadUserAnime()
      alert('Registrierung erfolgreich!')
    })
    .catch(error => {
      console.error('Fehler bei der Registrierung:', error)
      alert(error.message)
    })
}

// Abmelde-Funktion
const logout = () => {
  currentUser.value = null
  my_anime.value = []
  localStorage.removeItem('currentUser')
}

// Laden der Anime-Liste des angemeldeten Benutzers
const loadUserAnime = () => {
  if (!currentUser.value) return

  fetch(`${BACKEND_URL}/animes/user/${currentUser.value.id}`)
    .then(response => response.json())
    .then(data => {
      my_anime.value = data.map(anime => ({
        id: anime.id,
        title: anime.title,
        image: anime.imageUrl,
        total_episodes: anime.totalEpisodes,
        watched_episodes: anime.watchedEpisodes,
        is_favorite: false
      }))
      loadUserFavorites()
    })
    .catch(error => {
      console.error('Fehler beim Laden der Anime vom Backend:', error)
    })
}

const loadUserFavorites = () => {
  fetch(`${BACKEND_URL}/favorites/user/${currentUser.value.id}`)
    .then(res => res.json())
    .then(data => {
      userFavorites.value = data.map(fav => fav.animeId)
      // Anime-Liste aktualisieren
      my_anime.value.forEach(anime => {
        anime.is_favorite = userFavorites.value.includes(anime.id)
      })
    })
}

const toggleFavorite = anime => {
  if (!anime.is_favorite) {
    // Favorit hinzufügen
    fetch(`${BACKEND_URL}/favorites/user/${currentUser.value.id}/anime/${anime.id}`, {
      method: 'POST'
    }).then(() => {
      anime.is_favorite = true
    })
  } else {
    // Favorit entfernen
    fetch(`${BACKEND_URL}/favorites/user/${currentUser.value.id}/anime/${anime.id}`, {
      method: 'DELETE'
    }).then(() => {
      anime.is_favorite = false
    })
  }
}

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
  fetch(`${BACKEND_URL}/animes/user/${currentUser.value.id}`, {
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
        id: savedAnime.id,
        title: savedAnime.title,
        image: savedAnime.imageUrl,
        total_episodes: savedAnime.totalEpisodes,
        watched_episodes: savedAnime.watchedEpisodes
      })
    })
    .catch(error => {
      console.error('Fehler beim Speichern des Anime:', error)
    })
}

const removeAnime = anime => {
  // Backend-Aufruf zum Löschen des Anime
  fetch(`${BACKEND_URL}/animes/user/${currentUser.value.id}/anime/${anime.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(response => {
      if (response.ok) {
        my_anime.value = my_anime.value.filter(a => a.id !== anime.id)
      }
    })
    .catch(error => {
      console.error('Fehler beim Löschen des Anime:', error)
    })
}

const increaseEpisode = anime => {
  // Erhöhen des lokalen Zählers
  anime.watched_episodes++

  // Backend-Aufruf zum Aktualisieren des Anime
  updateAnimeEpisodes(anime)
}

const decreaseEpisode = anime => {
  // Verringern des lokalen Zählers (nicht unter 0)
  if (anime.watched_episodes > 0) {
    anime.watched_episodes--

    // Backend-Aufruf zum Aktualisieren des Anime
    updateAnimeEpisodes(anime)
  }
}

// Hilsfunktion zum Aktualisieren der watched_episodes
const updateAnimeEpisodes = (anime) => {
  fetch(`${BACKEND_URL}/animes/user/${currentUser.value.id}/anime/${anime.id}`, {
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
        console.error('Fehler beim Aktualisieren der Episoden')
      }
    })
    .catch(error => {
      console.error('Fehler beim Aktualisieren der Episoden:', error)
    })
}

onMounted(() => {
  // Überprüfen, ob ein Benutzer im localStorage gespeichert ist
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
    loadUserAnime()
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Roboto:wght@400;500&display=swap');

*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 20, 147, 0.9) 0%, rgba(148, 0, 211, 0.9) 100%);
  font-family: 'Roboto', sans-serif;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  margin: 0;
  padding: 1.5rem 2rem;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 100;
  position: relative;
}

h1 {
  font-family: 'Press Start 2P', cursive;
  font-size: 1.5rem;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  text-align: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

main {
  flex: 1;
  width: 100%;
  max-width: 768px;
  padding: 2rem 1.5rem;
  margin: 1.5rem auto 2rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: rgba(255, 255, 255, 0.25);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-left: auto;
}

.login-message {
  text-align: center;
  margin: 3rem 0;
  font-size: 1.2rem;
  color: #555;
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

form {
  display: flex;
  max-width: 480px;
  margin: 0 auto 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
}

form input {
  appearance: none;
  outline: none;
  border: none;
  background: white;
  display: block;
  color: #333;
  font-size: 1rem;
  padding: 0.75rem 1rem;
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
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
  transition: 0.3s;
  border-radius: 0.25rem;
}

.button:hover {
  background-position: right;
}

.button:active {
  transform: translateY(1px);
}

.results {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 450px;
  overflow-y: auto;
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.result {
  display: flex;
  margin: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
  transition: 0.3s;
  background-color: white;
}

.result:hover {
  border-color: #ccc;
  background-color: #f9f9f9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.result img {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-right: 1rem;
}

.details {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.flex-1 {
  flex: 1 1 0;
}

.details h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.details p {
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: 0.75rem;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.details .button {
  margin-left: auto;
}

.myanime {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-height: 450px;
  overflow-y: auto;
}

.myanime h2 {
  font-family: 'Press Start 2P', cursive;
  color: #555;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
}

.auth-container {
  min-height: 400px;
  padding: 2rem 0;
}

footer {
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
  color: white;
  font-size: 0.9rem;
  background-color: rgba(0, 0, 0, 0.15);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  header {
    flex-direction: column;
    padding: 1.5rem 1rem;
    justify-content: center;
  }

  h1 {
    position: static;
    transform: none;
    margin-bottom: 1rem;
  }
  .user-info {
    margin-top: 1rem;
    width: 100%;
    justify-content: center;
  }

  main {
    padding: 1.5rem 1rem;
    margin: 1rem 0.5rem;
    width: calc(100% - 1rem);
  }
}

@media (max-width: 480px) {
  .result {
    flex-direction: column;
  }

  .result img {
    width: 100%;
    height: 160px;
    margin-bottom: 0.75rem;
    margin-right: 0;
  }

  h1 {
    font-size: 1.3rem;
  }
}
</style>
