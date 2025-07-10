<script setup>
import { useUserStore } from '../stores/userStores'


const userStore = useUserStore()
</script>

<template>
  <div class="left_page">
    <div class="login_box">
      <template v-if="userStore.isLoggedIn">
        <h1>Hello <RouterLink :to="`/UserProfile/${userStore.currentUser}`"> {{ userStore.currentUser }} </RouterLink>!</h1>
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
          You are not logged in. <br />
          To continue, please: <br />
          <a href="/Login">Login</a> <br />
        </h1>
      </template>
    </div>
  </div>
</template> 

<style scoped>
h1 {
  font-weight: 500;
  font-size: 1.3rem;
  position: relative;
  text-align: center;
  margin-top: 10px;
}

.left_page {
  text-align: left;
}

.login_box {
  border: 3px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background);
  text-align: left;
  word-wrap: break-word;
  width: 300px;
  height: 200px;
}   

.user_stats {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding: 0 10px;
}

.stat {
  text-align: center;
  flex: 1;
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