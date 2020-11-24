<template>


  <div >

    <b-jumbotron style="text-align:center" >
      <h2>
        Basic Search
      </h2>
    </b-jumbotron>

<b-container>
  <b-card bg-variant="light">
    <b-form @submit="search" >
      <b-form-group
        label-cols=2
        label="Search"
        description="Enter any search string for the movie database for example  @genre:{Drama} @release_year:[1990 1995]">
        <b-form-input v-model="searchQuery" >
        </b-form-input>
      </b-form-group>
      
      <b-form-group
        label-cols=2
        label="Sample Queries">
        <b-form-select 
            v-model="selectedQueries" 
            :options="queryList"
            v-on:change="selectSampleQuery"
            ></b-form-select>
      </b-form-group>

      <b-form-group
        label-cols=2
        label="Sort by">
        <b-form-select 
            v-model="sortBy" 
            :options="sortByOptions"
            v-on:change="search"
            ></b-form-select>
      </b-form-group>

    <b-form-group 
        label="REST Implementation"
        label-cols=2>
      <b-form-radio 
          @change.native="search"
          v-model="apiServer" 
          name="some-radios" 
          value="java" >
            Java Jedis <small>(Port 8085)</small>
      </b-form-radio>
      <b-form-radio 
          @change.native="search"          
          v-model="apiServer" 
          name="some-radios" 
          value="node">
            Node.js <small>(port 8086)</small>
      </b-form-radio>
      <b-form-radio 
          @change.native="search"          
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

</template>

<script>
import { SearchClient } from './../lib/SearchClient';

export default {
  name: 'Home',
  data() {
    return {
      apiServer : "node",
      searchQuery : "*",
      searchOffset : 0,
      searchLimit : 10,
      searchResult : {
        meta :{},
        docs : {}
      },
      rows : 0,
      currentPage : 0,
      perPage : 10, 
      selectedQueries : null,    
      queryList : [],
      sortBy : null, 
      sortByOptions : [
        {value: null, text : "None/Default (Score)"},
        {value: "title:asc", text : "Title (Asc)"},
        {value: "title:desc", text : "Title (Desc)"},
        {value: "genre:asc", text : "Genre (Asc)"},
        {value: "genre:desc", text : "Genre (Desc)"},
        {value: "rating:asc", text : "Rating (Asc)"},
        {value: "rating:desc", text : "Rating (Desc)"},
        {value: "release_year:asc", text : "Release Year (Asc)"},
        {value: "release_year:desc", text : "Release Year (Desc)"},
      ]
    }
  },
  created() {
    this.queryList.push({ value: null, text: 'You can also select a sample query' });
    this.$sampleQueries.forEach(query => {
      this.queryList.push({ value: query.form, text: query.title });
    });
    this.search();
  },
  methods : {

    async search() {
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

    changePage(page) {
      this.searchOffset = page;
      this.search(); 
    },

    selectSampleQuery(value) {
      this.searchQuery = value;
      this.searchOffset = 0; 
      this.search();
    },

    goToMovie(id) {
      this.$router.push({ name: 'MovieForm', params: { id: id }});
    },    
  },

}
</script>
