<template>


  <div >

    <b-jumbotron style="text-align:center" >
      <h2>
        Faceted Search
      </h2>
    </b-jumbotron>

    <div class="container-fluid">
      <div class="row flex-xl-nowrap">
        <div class="col-md-3 col-xl-2 bd-sidebar">
          <small>Release Year</small>
           <vue-slider
            ref="yearSlider"
            v-model="selectedYears" 
            min="1960"
            max="2020"
            :enable-cross="false"
            @change="changeSlider"
          ></vue-slider>
          <hr/>


          <small>Rating</small>
           <vue-slider
            ref="ratingSlider"
            v-model="selectedRatings" 
            min="0"
            max="10"
            :enable-cross="false"
            @change="changeSlider"
          ></vue-slider>
          <hr/>     


          <small>Genre</small>
          <b-list-group >
            <b-list-group-item 
              v-for="(item, index) in genreList" 
              :key="item.genre" 
              action class="small"
              v-bind:class="{ 'active' : isSelected(index) }"
              v-on:click="selectGenre(index, item)"
              >
              {{item.genre}}
              <b-badge class="small"  pill>{{item.nb_of_movies}}</b-badge>
            </b-list-group-item>
          </b-list-group>



        </div>
        <b-container>

          <b-card bg-variant="light" >

            <b-row>
              <b-col cols="5">

            <b-form @submit="search" >
              <b-form-group
                label-cols=2
                label="Search" >
                <b-form-input v-model="query" >
                </b-form-input>
              </b-form-group>
              
            <b-form-group 
                label="REST"
                label-cols=2>
              <b-form-radio 
                  @change.native="switchLangage"
                  v-model="apiServer" 
                  name="some-radios" 
                  value="java" >
                    Java Jedis <small>(Port 8085)</small>
              </b-form-radio>
              <b-form-radio 
                  @change.native="switchLangage"          
                  v-model="apiServer" 
                  name="some-radios" 
                  value="node">
                    Node.js <small>(port 8086)</small>
              </b-form-radio>
              <b-form-radio 
                  @change.native="switchLangage"          
                  v-model="apiServer" 
                  name="some-radios" 
                  value="python">
                    Python <small>(port 8087)</small>
              </b-form-radio>
            </b-form-group>

            <b-form-group 
                label-cols=2>
                <b-button size="sm" text="Button" @click="search"  >Search</b-button>
            </b-form-group>

            </b-form>

              </b-col>
              <b-col cols="7">
                <br/>
                RediSearch Query:<br/> 
                <small class="text-monospace">FT.SEARCH idx:movie "{{searchQuery}}"</small>
              </b-col>
            </b-row>

          </b-card>


<b-container class="mb-2 mt-2">
<b-row v-if="searchResult.meta.totalResults">
  {{searchResult.meta.totalResults}} movies found, showing {{searchResult.meta.offset + 1}} to {{searchResult.meta.offset + searchResult.meta.limit }}
</b-row>
</b-container>

<b-row>
  <div 
    v-for="doc in searchResult.docs"
    :key="doc.meta.id"
    class="col-md-3 col-4 my-1">

    <b-card no-body >
      <b-card-body>
        <b-card-title>{{doc.fields.title}}</b-card-title>
        <b-card-sub-title class="mb-2">{{doc.fields.release_year}} </b-card-sub-title>
        <b-card-text>
          {{ doc.fields.plot }}
        </b-card-text>

        <b-card-text>
          <img v-if="(doc.fields.poster && doc.fields.poster != 'N/A' )" width=130 :src="doc.fields.poster" />
        </b-card-text>
      </b-card-body>

      <b-card-footer class="small">
        <b-row>
        <b-col>
        {{ doc.fields.genre }}
        </b-col>
        <b-col>
          <b-button size="sm" @click="goToMovie( doc.meta.id)">View</b-button>
        </b-col>           
        <b-col class="text-right">
        {{ doc.fields.rating }}
        </b-col>
        </b-row>
      </b-card-footer>

    </b-card>


  </div>
</b-row>


    <b-pagination class="justify-content-center"      
      v-if="currentPage"
      v-model="currentPage"
      :total-rows="rows"
      :per-page="perPage"
      first-text="First"
      prev-text="Prev"
      next-text="Next"
      last-text="Last"
      v-on:change="changePage"
    ></b-pagination>





        </b-container>
      </div>
    </div>



<hr>

  </div>

</template>

<script>
import { SearchClient } from './../lib/SearchClient';
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

export default {
  name: 'FacetedSearch',
  components: {
    VueSlider
  },
  data() {
    return {
      apiServer : "java",

      query: "",
      genreList : [],

      selectedYears: [1990,2010],
      selectedRatings: [5,10],

      selectedGenreIndex: -1,
      selectedGenre: undefined,

      searchQuery : undefined,
      searchOffset : 0,
      searchLimit : 10,
      searchResult : {
        meta :{},
        docs : {}
      },
      rows : 0,
      currentPage : 0,
      perPage : 10, 

    }
  },
  created() {
    this.loadMovieGenre();
    this.search();
  },
  methods : {

    async loadMovieGenre() {
      const {data} = await SearchClient.getMovieGroupBy(this.apiServer, "genre");
      const genres = data.rows;
      this.genreOptions = [];
      this.genreList = genres;
    },

    async search() {

      this.searchQuery = this.query +
         ` @release_year:[${this.selectedYears[0]} ${this.selectedYears[1]}]  `
        + ((this.selectedGenre == undefined)?`  `: ` @genre:{${this.selectedGenre}} `)
        +` @rating:[${this.selectedRatings[0]} ${this.selectedRatings[1]}]  `
        ;

      const {data} = await SearchClient.search(
                          this.searchQuery, 
                          this.searchOffset, 
                          this.searchLimit, 
                          this.sortBy, 
                          this.apiServer);
      
      
      this.searchResult = data;

      // organize pagination
      this.currentPage = 0;
      if (this.searchResult.docs.length != 0) {
        this.currentPage = (this.searchResult.meta.offset / this.searchResult.meta.limit);
        if (this.currentPage == 0) {
          this.currentPage = 1
        }
        this.rows = this.searchResult.meta.totalResults - this.searchResult.meta.limit;
        this.perPage = this.searchResult.meta.limit;
      }
    },
    
    goToMovie(id) {
      this.$router.push({ name: 'MovieForm', params: { id: id }});
    },  

    changePage(page) {
      this.searchOffset = page;
      this.search(); 
    },

    selectSampleQuery() {
      this.searchQuery =  `@genre:{${this.selectedGenre}}` ;
      this.searchOffset = 0; 
      this.search();
    },

    switchLangage() {
      this.search();
      this.loadMovieGenre();
    },

    isSelected(i) {
      return i === this.selectedGenreIndex
    },

    selectGenre(index, item) {
      this.selectedGenreIndex = index;
      this.selectedGenre = item.genre;
      this.search();
    },
    
    changeSlider() {
      this.search();
    },
  },

}
</script>
