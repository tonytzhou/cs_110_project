<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <RouterLink to="/">
      <img src="/logo.png" alt="Logo" class="logo" />
    </RouterLink>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/Login">Login</RouterLink>
      <RouterLink to="/Favorites">Favorites</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  position: relative;      /* for absolute‑positioned logo */
  text-align: center;      /* center the nav */
}

/* clickable logo on top‑left, responsive height */
.logo {
  position: absolute;
  left: 1.3rem;
  top: 50%;
  transform: translateY(-40%);
  height: clamp(60px, 10vw, 110px); /* min 60px, scales with viewport, max 110px */
  width: auto;
  cursor: pointer;         /* indicate it’s clickable */
}

nav {
  display: inline-block;   /* centers via header’s text-align */
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}
nav a:first-of-type {
  border: none;
}
nav a.router-link-exact-active {
  color: var(--color-text);
}
nav a.router-link-exact-active:hover {
  background-color: transparent;
}

@media (min-width: 1024px) {
  nav {
    font-size: 1.3rem;
    margin-top: 2rem;
  }
}
</style>
