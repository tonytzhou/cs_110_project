<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/userStores'
import { RouterLink } from 'vue-router'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { getApp } from 'firebase/app'

const app = getApp()
const db = getFirestore(app)
const usersC = collection(db, 'users')

const userStore = useUserStore()
const suggestions = ref([])

onMounted(async () => {
  const snap  = await getDocs(usersC)
  const users = snap.docs.map(d => d.data())

  if (userStore.isLoggedIn) {
    const following = await userStore.fetchMyFollowingList()
    suggestions.value = users
      .filter(u =>
        u.email !== userStore.currentUser &&
        !following.includes(u.email)
      )
      .slice(0, 5)
      .map(u => ({ email: u.email, isFollowing: false }))
  } else {
    // logged-out: show everyone
    suggestions.value = users.map(u => ({ email: u.email }))
  }
})

async function toggleFollow(u) {
  if (u.isFollowing) {
    await userStore.unfollowUserByEmail(u.email)
    u.isFollowing = false
  } else {
    await userStore.followUserByEmail(u.email)
    u.isFollowing = true
  }
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
            >
              {{ u.email }}
            </RouterLink>
            <button
              class="btn-follow"
              @click="toggleFollow(u)"
            >
              {{ u.isFollowing ? 'Unfollow' : 'Follow' }}
            </button>
          </div>
        </div>
        <div v-else>
          <h2>No one new to follow right now.</h2>
        </div>
      </template>

      <template v-else>
        <h1>All users:</h1>
        <div v-if="suggestions.length">
          <div
            v-for="u in suggestions"
            :key="u.email"
            class="suggestion"
          >
            <RouterLink
              :to="`/UserProfile/${u.email}`"
              class="suggestion_user"
            >
              {{ u.email }}
            </RouterLink>
          </div>
        </div>
        <div v-else>
          <h2>No users found.</h2>
        </div>
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
