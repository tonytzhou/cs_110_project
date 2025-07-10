<script setup>
import Feed from '../components/Feed.vue'
import Login from '../components/Login.vue'
import Follows from '../components/Follows.vue'

import { useRoute } from 'vue-router'

const route = useRoute()
const email = route.params.email
</script>

<template>
  <main class = "layout">
    <Login />
    
    <Feed />
    <Follows />
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