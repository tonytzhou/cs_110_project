<script setup>
import Feed from '../components/Feed.vue'
import Login from '../components/Login.vue'
import Follows from '../components/Follows.vue'
import { onMounted } from 'vue'
import { useUserStore } from '../stores/userStores'

const userStore = useUserStore()

onMounted(() => {
  userStore.viewingUser = ''
})
</script>

<template>
  <main class = "layout">
    <Login /> 
    <Feed />
  </main>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: row;
  gap: 5px; 
  padding: 20px;
  align-items: flex-start; 
}

</style>
