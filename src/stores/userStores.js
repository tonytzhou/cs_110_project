import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: '',
    viewingUser: '',
    isLoggedIn: false,
    mode: 'login',

    followersCount: 0,
    followingCount: 2,
    postCount: 3
  }),

  actions: {
    toggleMode(newMode) {
      this.mode = newMode
    },

    login(userEmail) {
      this.currentUser = userEmail
      this.isLoggedIn = true
    },

    logout() {
      this.currentUser = ''
      this.isLoggedIn = false
    },

    incrementFollowing() {
      this.followingCount += 1
    },

    incrementFollowers() {
      this.followersCount += 1
    }
  },

  getters: {
    isLogin: (state) => state.mode === 'login',
    isViewingAnotherUser: (state) => state.viewingUser !== ''
  }
})