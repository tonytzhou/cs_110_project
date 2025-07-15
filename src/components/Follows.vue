<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore }  from '../stores/userStores'
import { RouterLink }    from 'vue-router'

const userStore   = useUserStore()
const suggestions = ref([])

async function fetchRandomUsers() {
  const fake = [
    { email: 'alice@example.com' }
  ]
  return fake
}

onMounted(async () => {
  const all = await fetchRandomUsers()
  suggestions.value = all
    .filter(u => u.email !== userStore.currentUser)
    .slice(0, 3)
    .map(u => ({ ...u, isFollowing: false }))
})

function toggleFollow(u) {
  u.isFollowing = !u.isFollowing
  userStore.followingCount += u.isFollowing ? 1 : -1
}
</script>

<template>
  <div class="right_page">
    <div class="follows_box">
      <template v-if="userStore.isLoggedIn">
        <h1>Who to follow:</h1>
        <div v-if="suggestions.length">
          <div
            v-for="u in suggestions"
            :key="u.email"
            class="suggestion"
          >
            <RouterLink
              :to="`/UserProfile/${u.email}`"
              class="suggestion_user"
            >{{ u.email }}</RouterLink>
            <button
              class="btn-follow"
              @click="toggleFollow(u)"
            >
              {{ u.isFollowing ? 'Unfollow' : 'Follow' }}
            </button>
          </div>
        </div>
        <div v-else>
          <h2>No one to follow right now.</h2>
          <h2>Please check back later.</h2>
        </div>
      </template>

      <template v-else>
        <h1>Who to follow:</h1>
        <h2>You are not logged in.</h2>
        <h2>Please log in to see suggestions.</h2>
      </template>
    </div>
  </div>
</template>

<style scoped>
.right_page {
  text-align: right;
}

.follows_box {
  width: 300px;
  min-height: 200px;
  padding: 1rem;
  border: 3px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background);
  text-align: center;
}

h1 {
  font-weight: 500;
  font-size: 1.6rem;
  margin-bottom: 0.8rem;
}

h2 {
  font-weight: 300;
  font-size: 1.3rem;
  margin: 0.4rem 0;
}

.suggestion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
}

.suggestion_user {
  flex: 1;
  text-align: left;
  color: var(--color-primary);
  word-break: break-all;
}

.btn-follow {
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 6px;
  background-color: var(--color-border);
  cursor: pointer;
}
</style>
