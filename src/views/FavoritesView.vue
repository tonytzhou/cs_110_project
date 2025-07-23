<script setup>
import { ref, onMounted } from 'vue'
import Feed from '../components/Feed.vue'
import Login from '../components/Login.vue'
import ScreenshotButton from '../components/ScreenshotButton.vue'
import { useUserStore } from '../stores/userStores'

const userStore = useUserStore()
const feedComp = ref(null)

onMounted(() => {
  userStore.viewingUser = ''
})
</script>

<template>
  <main class="layout">
    <Login />
    <Feed ref="feedComp" />
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

.feed-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>  