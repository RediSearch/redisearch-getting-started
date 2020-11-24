<template>
  <b-container>
    <h1>Movies</h1>
    <div>
      <b-row class="mb-3">
        <b-col>
          <div>
            Genre:
            <b-form-select
              v-model="selectedGenre"
              :options="genreOptions"
              v-on:change="fetch"
              class="mt-3"
            ></b-form-select>
          </div>
        </b-col>

        <b-col>
          <div>
            Release Year:
            <b-form-select
              v-model="selectedYear"
              :options="yearOptions"
              v-on:change="fetch"
              class="mt-3"
            ></b-form-select>
          </div>
        </b-col>
        <b-col> </b-col>
        <b-col>
                      <div>
            Sort By:
            <b-form-select
              v-model="selectedSortBy"
              :options="sortByOptions"
              v-on:change="fetch"
              class="mt-3"
            ></b-form-select>
          </div>
        </b-col>
      </b-row>

      <b-table
        sticky-header="800px"
        striped
        hover
        v-if="!isLoading"
        :items="computedRecords"
        :fields="fields"
        @row-clicked="clickRow"
      >
      </b-table>
    </div>
  </b-container>
</template>

<script>
import { SearchClient } from "@/lib/SearchClient";

export default {
  name: "movie-list",

  data() {
    return {
      apiServer : "node",
      isLoading: false,
      selectedGenre: "all",
      genreOptions: [],
      genreList: [],
      selectedYear: 0,
      sortByOptions: [],
      selectedSortBy: "default",
      yearOptions: [],
      searchQuery: "*",
      searchOffset: 0,
      searchLimit: 200,
      searchResult: {
        meta: {},
        docs: {},
      },
      fields: [
        { key: "title" },
        { key: "release_year" },
        { key: "genre" },
        { key: "rating" },
      ],
      records: [],
    };
  },

  created() {
    this.loadMovieGenre();
    // load years
    this.yearOptions.push({ text : "All" , value : 0 });
    for (let i = 2021 ; i >= 1960  ; i-- ) {
        this.yearOptions.push({ text : i , value : i });
    }
    // load sort by options
    this.sortByOptions = [
        {value : "default", text : "Default"},
        {value : "release_year:asc", text : "Year (Asc)"},
        {value : "release_year:desc", text : "Year (Desc)"},
        {value : "genre:asc", text : "Genre (Asc)"},
        {value : "genre:desc", text : "Genre (Desc)"},
        {value : "rating:asc", text : "Rating (Asc)"},
        {value : "rating:desc", text : "Rating (Desc)"},
        {value : "title:asc", text : "Title (Asc)"},
        {value : "title:desc", text : "Title (Desc)"},
    ];
    this.fetch();
  },

  methods: {
    async fetch() {
      this.isLoading = true;
      this.searchQuery = "";

      // change query based on form
      if ( this.selectedGenre && this.selectedGenre != "all"  ) {
         this.searchQuery = this.searchQuery + ` @genre:{${this.selectedGenre}} `  
      }

      // add year
      if ( this.selectedYear && this.selectedYear != "all"  ) {
         this.searchQuery = this.searchQuery +  ` @release_year:[${this.selectedYear} ${this.selectedYear}] `  
      }

      if ( !this.searchQuery || this.searchQuery === "" ) {
          this.searchQuery = "*";
      }

      let sortBy = undefined;
      if (this.selectedSortBy != "default") {
          sortBy = this.selectedSortBy;
      }


      const {data} = await SearchClient.search(
                          this.searchQuery, 
                          this.searchOffset, 
                          this.searchLimit, 
                          sortBy, 
                          this.apiServer);

      this.isLoading = false;
      this.searchResult = data;

      this.records = data.docs.map((e) => {
        return {
          movie_id: e.meta.id,
          title: e.fields.title,
          release_year: e.fields.release_year,
          genre: e.fields.genre,
          rating: e.fields.rating,
        };
      });
    },

    clickRow(record, index) {
      // extract the number from the movie id
      this.$router.push({ name: "MovieForm", params: { id: record.movie_id } });
      console.log(` ${index} -- ${record} `);
    },

    async loadMovieGenre() {
      const { data } = await SearchClient.getMovieGroupBy(
        this.movieApiServer,
        "genre"
      );
      const genres = data.rows;
      this.genreOptions = [];
      this.genreList = genres;
      this.genreList.unshift({ genre: "all", nb_of_movies: "0" });
      this.genreOptions = this.genreList.map((item) => {
        return {
          value: item.genre,
          text: item.genre[0].toUpperCase() + item.genre.substring(1),
        };
      });
    },

  },

  computed: {
    computedRecords() {
      return this.records;
    },
  },
};
</script>