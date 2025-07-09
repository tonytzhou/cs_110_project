<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user'

const store = useUserStore()

const emailForm = ref('')
const password = ref('')

const handleSubmit = () => {
    if (!emailForm.value.includes('@') || !emailForm.value.includes('.com')) {
    alert(`EmailForm must contain @ and .com`)
    return
  }
    if (password.value.length < 6) {
    alert(`Password must be at least 6 characters long`)
    return
  }

  store.login(emailForm.value)
  emailForm.value = ''
  password.value = ''
}
</script>

<template>
  <div class="form-container">
    <form>
      <div class="option">
        <a :class="{ active: store.isLogin }" @click.prevent="store.toggleMode('login')">Log In</a>
        <a :class="{ active: !store.isLogin }" @click.prevent="store.toggleMode('signup')">Sign Up</a>
      </div>

      <template v-if="!store.isLoggedIn">
        <input type="text" v-model="emailForm" placeholder="Email" />
        <input type="password" v-model="password" placeholder="Password" />
        <button type="button" @click="handleSubmit">{{ store.isLogin ? 'Log In' : 'Sign Up' }}</button>
      </template>

      <template v-else>
        <h1>{{ store.currentUser }}</h1>
        <button type="button" @click="store.logout">Log Out</button>
      </template>
    </form>
  </div>
</template>
<style>

.form-container{
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: lightblue;
    width: fit-content;
    margin: auto;
    padding: 0px 15px 0px 15px;
}
.option{
    width: 175px;
    font-size: 16px;
    color: black;
    display: flex;
    justify-content: space-evenly;
    margin-bottom: 20px;
    margin-top: 10px;
}
a.active {
    text-decoration: underline;

}
form{
    display: flex;
    flex-direction: column;
    width: 175px;
}
form input{
    margin-bottom: 15px;
}
form button{
    margin-bottom: 15px;
}
h1 {
    font-size: 14px;
}
</style>