<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStores'

const route = useRoute()
const userStore = useUserStore()

const viewingEmail = computed(() =>
  route.params.email || userStore.currentUser
)

const isFollowing = computed(() => userStore.isFollowingViewingUser)

watch(
  viewingEmail,
  email => {
    if (email) {
      userStore.setViewingUser(email)
    }
  },
  { immediate: true }
)

async function toggleFollow() {
  if (userStore.isFollowingViewingUser) {
    await userStore.unfollowUser()
  } else {
    await userStore.followUser()
  }
}
</script>

<template>
  <div class="left_page">
    <div class="login_box">
      <template v-if="userStore.isLoggedIn">
        <h1>
          This is
          <span class="username">{{ userStore.viewingUser }}</span>
          ’s profile!
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
          You are not logged in.<br />
          To continue, please:<br />
          <RouterLink to="/login">Login</RouterLink>
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
  text-align: center;
  width: 300px;
  height: 200px;
  padding: 1rem;
  border: 3px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background);
}
h1 {
  font-weight: 500;
  font-size: 1.3rem;
  margin: 0.5rem 0;
}
.username {
  display: inline-block;
  margin: 0 0.3rem;
  font-weight: bold;
  color: var(--color-primary);
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
  font-weight: bold;
  font-size: 1.4rem;
  color: var(--color-text);
}
.stat_label {
  font-size: 0.9rem;
  color: gray;
}
.follow_box {
  margin-top: 1rem;
  width: 300px;
  display: flex;
  justify-content: center;
}
.btn-follow {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: var(--color-border);
  color: var(--color-text);
  font-size: 1rem;
  cursor: pointer;
}
</style>