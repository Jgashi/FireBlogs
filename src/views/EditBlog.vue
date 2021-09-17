<template>
  <keep-alive>
    <div class="create-post">
      <BlogCoverPreview v-show="this.$store.state.blogPhotoPreview" />
      <Loading v-show="loading"/>
      <div class="container">
        <div class="blog-info">
          <input type="text" placeholder="Enter Blog Title" v-model="blogTitle">
          <div class="upload-file">
            <label for="blog-photo"> {{ this.up }} 
              <div class="icon">
                <Upload class="upload"/>
              </div>
            </label>
            <input type="file" ref="blogPhoto" id="blog-photo" @change="fileChange" accept=".png, .jpg, jpeg">
            
            <button class="preview" @click="openPreview" :class="{ 'button-inactive': !this.$store.state.blogPhotoFileURL }"> {{ this.pre }}
              <div class="icon">
                <ImagePic class="image" />
              </div>
            </button>
            <span>File Chosen: {{ this.$store.state.blogPhotoName }}</span>
          </div>
        </div>
        <div class="enditor">
          <vue-editor :editorOptions="editorSettings" v-model="blogHTML" useCustomImageHandler @image-added="imageHandler" />
        </div>
        <div class="blog-actions">
          <button @click="updateBlog">Save Change</button>
          <router-link class="router-button" :to="{name : 'BlogPreview'}">Post Changes</router-link>
        </div>
        <div :class="{invisible: !error}" class="err-message">
          <p><span>Error:</span>{{ this.errorMsg }}</p>
        </div>
      </div>
    </div>
  </keep-alive>
</template>

<script>
import Upload from "../assets/Icons/upload.svg";
import ImagePic from "../assets/Icons/image.svg"
import firebase from "firebase/app";
import "firebase/storage";
import db from "../firebase/firebaseInit";
import BlogCoverPreview from '../components/BlogCoverPreview.vue'
import Quill from "quill";
import Loading from '../components/Loading.vue';
window.Quill = Quill;
const ImageResize = require("quill-image-resize-module").default;
import { ImageDrop } from 'quill-image-drop-module'
//Register the custom modules with Quill
Quill.register("modules/imageDrop", ImageDrop);
Quill.register("modules/imageResize", ImageResize);
export default {
  name: "EditBlog",
  data() {
    return {
      file: null,
      error: null,
      errorMsg: null,
      loading: null,
      routeID: null,
      currentBlog: null,
      windowWidth: null,
      up: "",
      pre: "",
      editorSettings: {
        modules: {
          imageDrop: true,
          imageResize: {},
        }
      }
    }
  },
  created() {
    window.addEventListener('resize', this.checkScreem);
    this.checkScreem();
  },
  components: {
    BlogCoverPreview,
    Loading,
    Upload,
    ImagePic
  },
  async mounted() {
    //Get routeID from dynamic path
    this.routeID = this.$route.params.blogid;
    this.currentBlog = await this.$store.state.blogPosts.filter((post) => {
      return post.blogID === this.routeID;
    });
    //Becouse currentBlog is an array, we only need data in array[0] to set store state and data rerender
    this.$store.commit('setBlogState', this.currentBlog[0]);
  },
  methods: {
    checkScreem() {
      this.windowWidth = window.innerWidth;
      if (this.windowWidth <= 900) {
        this.up = "";
        this.pre = "";
        return;
      }
      this.up = "Upload Cover Photo";
      this.pre = "Preview Photo";
      return;
    },
    fileChange() {
      this.file = this.$refs.blogPhoto.files[0];
      const fileName = this.file.name;
      this.$store.commit("fileNameChange", fileName);
      this.$store.commit("createFileURL", URL.createObjectURL(this.file));
    },

    openPreview() {
      this.$store.commit("openPhotoPreview");
    },

    imageHandler(file, Editor, cursorLocation, resetUploader) {
      const storageRef = firebase.storage().ref();
      const docRef = storageRef.child(`documents/blogPostPhotos/${file.name}`)
      docRef.put(file).on(
        "state_changed",
        () => {
        },
        (err) => {
          console.log(err)
        },
        async () => {
          const downloadURL = await docRef.getDownloadURL();
          Editor.insertEmbed(cursorLocation, "image", downloadURL);
          resetUploader();
        }
      );
    },

    async updateBlog() {
      const dataBase = await db.collection("blogPosts").doc(this.routeID);
      if (this.blogTitle.length !== 0 && this.blogHTML.length !== 0) {
        if (this.file) {
          this.loading = true;
          const storageRef = firebase.storage().ref();
          const docRef = storageRef.child(`documents/blogCoverPhotos/${this.$store.state.blogPhotoName}`);
          docRef.put(this.file).on(
            "state_changed",
            () => {
              // console.log(snapshot);
            },
            (err) => {
              this.error = true;
              this.errorMsg = err.message;
              this.loading = false;
              setTimeout(() => {
                this.error = false;
              }, 5000);
              return
            }, 
            async () => {
              const downloadURL = await docRef.getDownloadURL();
              await dataBase.update({
                blogHTML: this.blogHTML,
                blogCoverPhoto: downloadURL,
                blogCoverPhotoName: this.blogCoverPhotoName,
                blogTitle: this.blogTitle
                //Don't need update blogId, profileId and date
              });
              //After edmit post, reorganize the list in Blog and get blogPosts
              await this.$store.dispatch("updatePost", this.routeID);
              this.loading = false;
              this.$router.push({ name: "ViewBlog",params: { blogid : dataBase.id} });
            }
          );
          return;
        }
        this.loading = true;
        //if coverPhoto did't change
        await dataBase.update({
          blogHTML: this.blogHTML,
          blogTitle: this.blogTitle,
        });
        await this.$store.dispatch("updatePost", this.routeID);
        this.loading = false;
        this.$router.push( {name: "ViewBlog", params: { blogid: dataBase.id } });
        return;
      } 
      this.error = true;
      this.errorMsg = "Please ensure Blog Title & Blog Post has been filled!";
      setTimeout(() => {
        this.error = false;
      }, 5000);
    }
  },
  computed: {
    profileId() {
      return this.$store.state.profileId;
    },
    blogCoverPhotoName() {
      return this.$store.state.blogPhotoName;
    },
    blogTitle: { 
      get() {
        return this.$store.state.blogTitle;
      },
      set(payload){
        this.$store.commit("updateBlogTitle", payload);
      }
    },
    blogHTML: { 
      get() {
        return this.$store.state.blogHTML;
      },
      set(payload){
        this.$store.commit("newBlogPost", payload);
      }
    },
  },
  beforeRouteEnter (to, from, next) {
    if(from.name === 'BlogPreview') {
      to.meta.keepAlive = true;
      next();
      return
    }
    to.meta.keepAlive = false;
    next();
  }
}
</script>
