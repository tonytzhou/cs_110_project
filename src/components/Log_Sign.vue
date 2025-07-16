<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { useUserStore } from '../stores/userStores'
import { config } from '../firebaseResources'

const app  = initializeApp(config)
const auth = getAuth(app)

const isLogin = ref(true)
const email = ref('')
const password  = ref('')
const errMsg = ref('')
const router = useRouter()
const userStore = useUserStore()

const register = async () => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email.value, password.value)
    userStore.login(user.email ?? user.uid)
    errMsg.value   = ''
    email.value    = ''
    password.value = ''
    router.push('/')
  } catch (e) {
    errMsg.value = e.message
  }
}

const login = async () => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email.value, password.value)
    userStore.login(user.email ?? user.uid)
    errMsg.value   = ''
    email.value    = ''
    password.value = ''
    router.push('/')
  } catch (e) {
    errMsg.value = e.message
  }
}

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    userStore.login(result.user.email ?? result.user.uid)
    errMsg.value = ''
    router.push('/')
  } catch (e) {
    errMsg.value = e.message
  }
}

const logout = async () => {
  try {
    await signOut(auth)
    userStore.logout()
    router.push('/')
  } catch (e) {
    console.error('Logout failed:', e)
  }
}
</script>

<template>
  <div class="auth-container">
    <template v-if="!userStore.isLoggedIn">
      <div class="mode-switch">
        <button :class="{ active: isLogin }"  @click="isLogin = true"  type="button">Log In</button>
        <button :class="{ active: !isLogin }" @click="isLogin = false" type="button">Sign Up</button>
      </div>

      <h1>{{ isLogin ? 'Log In' : 'Sign Up' }}</h1>

      <p><input type="email"placeholder="Email"v-model="email"/></p>
      <p><input type="password" placeholder="Password" v-model="password" /></p>
      <p v-if="errMsg" style="color:red">{{ errMsg }}</p>

      <p>
        <button type="button" @click="isLogin ? login() : register()">
          {{ isLogin ? 'Log In' : 'Sign Up' }}
        </button>
      </p>

      <p>
        <button type="button" @click="signInWithGoogle">
          Sign In With Google
        </button>
      </p>
    </template>

    <template v-else>
      <h1>{{ userStore.currentUser }}</h1>
      <button type="button" @click="logout">Log Out</button>
    </template>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 350px;
  margin: 40px auto;
  padding: 30px;
  border: 3px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  text-align: center;
}

.mode-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.mode-switch button {
  flex: 1;
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
}
.mode-switch button.active {
  text-decoration: underline;
  color: var(--color-link);
}

input {
  width: 100%;
  margin-bottom: 15px;
  padding: 8px;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  padding: 10px 20px;
  margin-bottom: 15px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background: #f0f0f0;
  cursor: pointer;
}
</style>
