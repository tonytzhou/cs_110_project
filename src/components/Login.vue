<template>
    <div class="left_page">
        <div class ="login_box">
            <h1> You are not logged in. <br>
                To continue, please: <br>
                <a href="/Login">Login</a> <br>
            </h1>
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

.left_page{
  text-align: left;
  
}

.login_box {
  border: 3px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background);
  text-align: left;
  word-wrap: break-word;
  width: 300px;
  height: 300px;
}
</style>