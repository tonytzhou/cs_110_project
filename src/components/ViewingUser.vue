<template>
  <div class="left_page">
    <div class="login_box">
      <template v-if="userStore.isLoggedIn">
        <h1>
          This is
          <span class="h1">{{ userStore.viewingUser }}</span>
          ’s profile!
        </h1>

        <div class="user_stats">
          <div class="stat">
            <div class="stat_number">{{ userStore.postCount }}</div>
            <div class="stat_label">Posts</div>
          </div>
          <div class="stat">
            <div class="stat_number">{{ userStore.followingCount }}</div>
            <div class="stat_label">Following</div>
          </div>
          <div class="stat">
            <div class="stat_number">{{ userStore.followersCount }}</div>
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
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute }     from 'vue-router'
import { useUserStore } from '../stores/userStores'

const route = useRoute()
const userStore = useUserStore()

const viewingEmail = computed(() =>
  route.params.email || userStore.currentUser
)

watch(
  viewingEmail,
  email => email && userStore.setViewingUser(email),
  { immediate: true }
)
</script>

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

.h1 {
  display: block;
  margin: 0.3rem 0;
  font-size: 1.4rem;
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
</style>