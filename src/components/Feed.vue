<script setup>
defineProps({
  msg: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: new Date().toLocaleDateString(),
  },
  time: {
    type: String,
    default: new Date().toLocaleTimeString(),
  }
})
</script>

<template>
    <div class="center_page">
     <h1>Hi, user! Welcome to your feed!</h1>
     <div class="wrapper">
        <div class ="user_post_box">
            <div class="post_user">Brian Crites</div>
            <div class="post_content">1st post man!</div>
            <div class="post_info">Posted on {{ date }}, {{ time }}</div>
        </div>
    </div>
    </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.center_page{
  text-align: center;
}

.wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min-content, max-content));
    gap: 20px;
    padding: 20px;
    justify-content: center;
    align-items: start;
    margin: 0 auto;
}

.user_post_box {
  position: relative; 
  border: 3px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background);
  padding: 40px 15px 15px 15px; 
  text-align: left; 
  display: block;
  word-wrap: break-word;
  width: 800px;
  max-height: 300px;
}


.post_user {
  position: absolute;
  top: 10px;
  left: 15px;
  font-weight: bold;
  font-size: 1.3rem;
}

.post_info{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: left;
    justify-content: left;
}

.post_content{
    font-size: 1.2rem;
    color: var(--color-text);
}

</style>
