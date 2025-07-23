<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStores'

const route      = useRoute()
const router     = useRouter()
const userStore  = useUserStore()

const viewingEmail = computed(() =>
  route.params.email || userStore.currentUser
)

const isFollowing = computed(() => userStore.isFollowingViewingUser)

const isViewingFavorites = computed(() =>
  route.name === 'UserFavorites'
)

watch(
  viewingEmail,
  email => { if (email) userStore.setViewingUser(email) },
  { immediate: true }
)

async function toggleFollow() {
  if (isFollowing.value) {
    await userStore.unfollowUser()
  } else {
    await userStore.followUser()
  }
}

function toggleFavorites() {
  if (isViewingFavorites.value) {
    router.push({
      name: 'UserProfile',
      params: { email: viewingEmail.value }
    })
  } else {
    router.push({
      name: 'UserFavorites',
      params: { email: viewingEmail.value }
    })
  }
}
</script>

<template>
  <div class="left_page">
    <div class="login_box">
      <template v-if="userStore.isLoggedIn">
        <h1>
          <template v-if="isViewingFavorites">
            These are their favorite posts!
          </template>
          <template v-else>
            This is
            <span class="username">{{ userStore.viewingUser }}</span>
            ’s profile!
          </template>
        </h1>

        <div class="user_stats">
          <div class="stat">
            <div class="stat_number">{{ userStore.viewingPostCount }}</div>
            <div class="stat_label">Posts</div>
          </div>
          <div class="stat">
            <div class="stat_number">{{ userStore.viewingFollowingCount }}</div>
            <div class="stat_label">Following</div>
          </div>
          <div class="stat">
            <div class="stat_number">{{ userStore.viewingFollowersCount }}</div>
            <div class="stat_label">Followers</div>
          </div>
        </div>
      </template>
      <template v-else>
        <h1>
          You are not logged in.<br/>
          To continue, please:<br/>
          <router-link to="/login">Login</router-link>
        </h1>
      </template>
    </div>

    <div
      v-if="userStore.isLoggedIn && viewingEmail !== userStore.currentUser"
      class="follow_box"
    >
      <button class="btn-follow" @click="toggleFollow">
        {{ isFollowing ? 'Unfollow' : 'Follow' }}
      </button>
    </div>

    <div
      v-if="userStore.isLoggedIn && viewingEmail !== userStore.currentUser"
      class="favorites_box"
    >
      <button class="btn-follow" @click="toggleFavorites">
        {{ isViewingFavorites ? 'Back to their Feed' : 'View Favorite Posts' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.left_page {
  text-align: left;
}

.login_box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 200px;
  padding: 1rem;
  border: 3px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background);
  text-align: center;
}

h1 {
  font-size: 1.3rem;
  font-weight: 500;
  margin: 0.5rem 0;
}

.username {
  font-weight: bold;
  margin: 0 0.3rem;
  color: var(--color-text);
}

.user_stats {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.5rem;
}

.stat {
  flex: 1;
  text-align: center;
}

.stat_number {
  font-size: 1.4rem;
  font-weight: bold;
}

.stat_label {
  font-size: 0.9rem;
  color: gray;
}

.follow_box,
.favorites_box {
  width: 300px;
  display: flex;
  justify-content: center;
}

.follow_box {
  margin-top: 1rem;
}

.favorites_box {
  margin-top: 0.5rem;
}

.btn-follow {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  cursor: pointer;
  text-align: center;
}
</style>
