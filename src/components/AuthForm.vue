<!-- src/components/AuthForm.vue -->
<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>{{ mode === 'login' ? 'Anmelden' : 'Registrieren' }}</h2>

      <div class="form-group">
        <label for="username">Benutzername</label>
        <input
          type="text"
          id="username"
          v-model="username"
          placeholder="Gib deinen Benutzernamen ein"
          @keyup.enter="submitForm"
        />
      </div>

      <div class="button-group">
        <button
          @click="submitForm"
          class="button primary-button">
          {{ mode === 'login' ? 'Anmelden' : 'Registrieren' }}
        </button>
        <button
          @click="toggleMode"
          class="button secondary-button">
          {{ mode === 'login' ? 'Registrieren' : 'Zum Login' }}
        </button>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  onLogin: Function,
  onRegister: Function
});

const username = ref('');
const mode = ref('login');
const errorMessage = ref('');

const submitForm = () => {
  if (!username.value) {
    errorMessage.value = 'Bitte gib einen Benutzernamen ein.';
    return;
  }

  errorMessage.value = '';

  if (mode.value === 'login') {
    props.onLogin(username.value);
  } else {
    props.onRegister(username.value);
  }
};

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login';
  errorMessage.value = '';
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.auth-card {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #444;
  font-weight: 500;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  border-color: deeppink;
  outline: none;
}

.button-group {
  display: flex;
  gap: 0.75rem;
}

.primary-button {
  flex: 2;
}

.secondary-button {
  flex: 1;
  background-image: linear-gradient(to right, #9c27b0 50%, #673ab7 50%);
}

.error-message {
  margin-top: 1rem;
  color: #d32f2f;
  text-align: center;
  font-size: 0.9rem;
}
</style>
