<template>
  <div id="formContainer" >


    <h1>{{ movie.title }}</h1>
    <hr/>

    <b-container >
    <b-form v-if="show">
    <b-row>

      <b-col>   

        <b-alert
          :show="dismissCountDown"
          dismissible
          variant="success"
          @dismissed="dismissCountDown=0"
          @dismiss-count-down="countDownChanged"
        >
          <p>Movie saved</p>
        </b-alert>


          <b-form-group id="input-group-3" label="Title:" label-for="input-3">
            <b-form-input
              id="input-3"
              v-model="movie.title"
              required
            ></b-form-input>
          </b-form-group>


          <b-form-group id="input-group-3" label="Genre:" label-for="input-3">
            <b-form-input
              id="input-3"
              v-model="movie.genre"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-3" label="Votes:" label-for="input-3">
            <b-form-input
              id="input-3"
              v-model="movie.votes"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-3" label="Rating:" label-for="input-3">
            <b-form-input
              id="input-3"
              v-model="movie.rating"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-3" label="Release Year:" label-for="input-3">
            <b-form-input
              id="input-3"
              v-model="movie.release_year"
              required
            ></b-form-input>
          </b-form-group>

          <b-button v-on:click="saveMovie()" variant="primary">Submit</b-button>
          
          <hr/>


    </b-col>
    <b-col class="text-center">
      <div>
      <b-img :src="movie.poster" class="mb-4" />
      </div>
      
      <div>
        <b-form-textarea
        id="textarea"
        v-model="movie.plot"
        placeholder="Enter something..."
        rows="3"
        max-rows="6">
        </b-form-textarea>
      </div>

    </b-col>
    </b-row>
    </b-form>

    <Comments :item_id="$route.params.id" />


    </b-container>



  </div>
</template>

<script>
import { SearchClient } from '@/lib/SearchClient';
import Comments from '@/components/Comments.vue';


export default {
  name: "MovieForm",
  components: {
    Comments
  },
  data() {
    return {
      apiServer : "node",
      id: this.$route.params.id,
      movie : {
        title : null,
        genre : null,
        votes : null,
        rating : null,
        release_year : null,
      },
      show: true,
      msg: null,
      dismissSecs: 4,
      dismissCountDown: 0,
      showDismissibleAlert: false      
   };
  },
  created () {
    this.fetch();
    this.$parent.contextualHelp = ""},
  methods: {
    async fetch () {
      this.isLoading = true
      let { data } = await SearchClient.getMovie(this.apiServer,this.$route.params.id);
      this.movie = data;
      this.isLoading = false;
    },
    onReset(evt) {
      evt.preventDefault()
    },
    async saveMovie() {
        let { data } = await SearchClient.updateMovie(this.apiServer, this.$route.params.id, this.movie);
        console.log("Submit form "+ data);
        this.fetch();
        this.showAlert();

    },
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showAlert() {
      this.dismissCountDown = this.dismissSecs
    }

  },
};
</script>

<style scoped>
#formContainer {
  padding-right: 100px;
  padding-left: 100px;

}

#listContainer {
  padding-top: 20px;
}


</style>