<template>
  <div id="app">

<div style="margin-bottom:10px">
  <b-navbar toggleable="lg" type="dark" variant="dark">
    
    <b-navbar-brand style="margin-left:90px" to="/" >
      <img src="/imgs/redis-logo.svg" height="30" />
      Tutorial: RediSearch
    </b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav >
        <b-nav-item active  >|</b-nav-item>
        <b-nav-item active to="/search" >Basic Search</b-nav-item>
        <b-nav-item active  >|</b-nav-item>
        <b-nav-item active to="/faceted-search" >Faceted Search</b-nav-item>
      </b-navbar-nav>
    </b-collapse>


    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav class="ml-auto">
        <img src="/imgs/redislabs.png" height="30" />
      </b-navbar-nav>
      
    </b-collapse>
  </b-navbar>

</div>


<router-view />


<a href="https://github.com/RediSearch/redisearch-getting-started"><img src="/imgs/forkme_left_red.svg" style="position:absolute;top:0;left:0;" alt="Fork me on GitHub"></a>

  </div>
</template>

<script>
    
    export default {
        name: 'App',
        data() {
            return {
              sampleQueries: "sss",
            }
        }
    }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding-left: 20px;
  padding-right: 20px;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

#sticky {
  position: fixed; 
  bottom: 5px; 
  right: 10px;
  z-index: 99;
 }


#notification {
  position: fixed; 
  bottom: 5px; 
  left: 10px;
  z-index: 99;
 }

</style>