<template>
  <div class="about">
    <h5>Comments</h5>

    <div class="text-left">
      <b-card v-for="item in comments" :key="item.id" class="mt-2">
        <template #header>
          <h5 class="mb-0 small">
            <b-row>
              <b-col>{{ item.user_id }} on {{ item.dateAsString }}</b-col>
              <b-col class="text-right">Rating: {{ item.rating }}</b-col>
            </b-row>
          </h5>
        </template>
        <b-card-text>{{ item.comment }}</b-card-text>
        <template #footer>
          <span class="text-right">
            <b-button v-on:click="deleteComment(item.id)" size="sm"
              >Delete</b-button
            >
          </span>
        </template>
      </b-card>

      <hr />
      <div>Add new comment</div>

      <b-form @submit="saveComment">
        <b-container>
          <b-row>
            <b-col class="text-right" cols="1">Name:</b-col>
            <b-col>
              <b-form-input
                id="input_user_id"
                v-model="newComment.user_id"
                required
              ></b-form-input>
            </b-col>

            <b-col class="text-right">Rating:</b-col>
            <b-col>
              <b-form-select
                v-model="newComment.rating"
                :options="optionsRating"
              ></b-form-select>
            </b-col>
          </b-row>

          <b-row class="mt-2">
            <b-col cols="1">Comment:</b-col>
            <b-col>
              <b-form-textarea
                id="input_comment"
                v-model="newComment.comment"
                required
              >
              </b-form-textarea>
            </b-col>
          </b-row>

          <b-row class="mt-2">
            <b-col class="text-center">
              <b-button v-on:click="saveComment()" size="sm"
                >Save Comment</b-button
              >
            </b-col>
          </b-row>
        </b-container>
      </b-form>
    </div>
  </div>
</template>

<script>
import { SearchClient } from "./../lib/SearchClient";

export default {
  name: "comments-component",
  props: {
    item_type: {
      type: String,
      default: "movie",
    },
    item_id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      apiServer : "node",
      isLoading: false,
      comments: [],
      newComment: {
        movie_id: this.item_id,
        user_id: null,
        comment: null,
        rating: null,
      },
      optionsRating: [
        { value: "1", text: "1" },
        { value: "2", text: "2" },
        { value: "3", text: "3" },
        { value: "4", text: "4" },
        { value: "5", text: "5" },
        { value: "6", text: "6" },
        { value: "7", text: "7" },
        { value: "8", text: "8" },
        { value: "9", text: "9" },
        { value: "10", text: "10" },
      ],
    };
  },
  created() {
    this.fetch();
  },
  methods: {
    async fetch() {
      this.isLoading = true;
      const { data } = await SearchClient.getMovieComment(
        this.apiServer,
        this.item_id
      );
      this.isLoading = false;
      // get comments, simple layout
      if (data && data.docs) {
        this.comments = data.docs.map((comment) => {
          const value = {
            id: comment.meta.id,
            timestamp: comment.fields.timestamp,
            dateAsString: comment.fields.timestamp,
            user_id: comment.fields.user_id,
            comment: comment.fields.comment,
            rating: comment.fields.rating,
          };
          return value;
        });
      } else {
        this.comments = [];
      }
    },
    async deleteComment(id) {
      const { data } = await SearchClient.deleteCommentById(
        this.apiServer,
        id
      );
      console.log(data);
      this.fetch();
    },
    async saveComment() {
      const { data } = await SearchClient.saveNewComment(
        this.apiServer,
        this.item_id,
        this.newComment
      );
      console.log(data);
      this.newComment = {
        movie_id: this.item_id,
        user_id: null,
        comment: null,
        rating: null,
      };
      this.fetch();
    },
  },
};
</script>