<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/userStores'

const userStore = useUserStore()

const userEmail = ref('')
const userPassword = ref('')

const handleSubmit = () => {
  userStore.login(userEmail.value)
  userEmail.value = ''
  userPassword.value = ''
}

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
</script>

<template>
  <div class="form-container">
    <form>

      <template v-if="!userStore.isLoggedIn">
        <div class="option">
          <a :class="{ active: userStore.isLogin }" @click.prevent="userStore.toggleMode('login')">Log In</a>
          <a :class="{ active: !userStore.isLogin }" @click.prevent="userStore.toggleMode('signup')">Sign Up</a>
        </div>
        <input type="text" v-model="userEmail" placeholder="Email" />
        <input type="password" v-model="userPassword" placeholder="Password" />
        <button type="button" @click="handleSubmit">
          {{ userStore.isLogin ? 'Log In' : 'Sign Up' }}
        </button>
      </template>

      <template v-else>
        <h1>{{ userStore.currentUser }}</h1>
        <button type="button" @click="userStore.logout">Log Out</button>
      </template>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  border: 3px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background);
  padding: 30px 40px;
  margin-top: 30px;
  width: 350px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  margin-left: 550px;
}

.option {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

a.active {
  text-decoration: underline;
  color: var(--color-link);
}

form {
  display: flex;
  flex-direction: column;
}

form input,
form button {
  margin-bottom: 15px;
  padding: 8px;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

form button {
  background-color: #f0f0f0;
  cursor: pointer;
}

h1 {
  font-size: 16px;
  margin-bottom: 10px;
}
</style>
