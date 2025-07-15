import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: '',
    viewingUser: '',
    isLoggedIn: false,
    mode: 'login',

    followersCount: 0,
    followingCount: 0,
    postCount: 0
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

    setViewingUser(viewUsername) {
      this.viewingUser = viewUsername
    },
  },

  getters: {
    isLogin: (state) => state.mode === 'login',
    isViewingAnotherUser: (state) => state.viewingUser !== ''
  }
})