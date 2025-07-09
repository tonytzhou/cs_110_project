<template>
    <div class="right_page">
        <div class ="follows_box">
            <h1> Who to follow:</h1>
            <h2> No one to follow.</h2>
            <h2> Please check back later.</h2>    
        </div>
    </div>
</template>

<style scoped>

h1{
    font-weight: 500;
    font-size: 1.6rem;
    position: relative;
    text-align: center;
    margin-top: 10px;
}

h2{
    font-weight: 300;
    font-size: 1.3rem;
    position: relative;
    text-align: center;
    margin-top: 7px;
}

.right_page{
  text-align: right;
  
}

.follows_box {
  border: 3px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background);
  text-align: right;
  word-wrap: break-word;
  width: 300px;
  height: 300px;
}
</style>