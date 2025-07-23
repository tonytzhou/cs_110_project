<script setup>
import { ref, onMounted } from 'vue'
import Feed from '../components/Feed.vue'
import ViewingUser from '@/components/ViewingUser.vue'
import Follows from '../components/Follows.vue'
import { useUserStore } from '../stores/userStores'

const userStore = useUserStore()
const feedComp = ref(null)

onMounted(() => {
  userStore.viewingUser = ''
})
</script>

<template>
  <main class="layout">
    <ViewingUser />
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

.feed-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>  