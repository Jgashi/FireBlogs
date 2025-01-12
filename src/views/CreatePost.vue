<template>
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
        <button @click="uploadBlog">Publish Blog</button>
        <router-link class="router-button" :to="{ name : 'BlogPreview' }">Post Preview</router-link>
      </div>
      <div :class="{invisible: !error}" class="err-message">
        <p><span>Error:</span>{{ this.errorMsg }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Upload from "../assets/Icons/upload.svg";
import ImagePic from "../assets/Icons/image.svg"
import firebase from "firebase/app";
import "firebase/storage";
import db from "../firebase/firebaseInit";
import BlogCoverPreview from '../components/BlogCoverPreview.vue'
import Loading from '../components/Loading.vue';
import Quill from "quill";
window.Quill = Quill;
const ImageResize = require("quill-image-resize-module").default;
import { ImageDrop } from 'quill-image-drop-module'
//Register the custom modules with Quill
Quill.register("modules/imageDrop", ImageDrop);
Quill.register("modules/imageResize", ImageResize);
export default {
  name: "CreatePost",
  data() {
    return {
      file: null,
      error: null,
      errorMsg: null,
      loading: null,
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
    this.$store.state.blogHTML = "write your blog title here...";
    this.$store.state.blogTitle = "";
    this.$store.state.blogPhotoName = "";
    this.$store.state.blogPhotoFileURL = null;
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
      //Get a reference to the storage service, which is used to create references in your storage bucket
      const storageRef = firebase.storage().ref();
      //Create a storage reference from our storage service
      //You can use the child() method on existing references to create references to lower levels in the tree.
      const docRef = storageRef.child(`documents/blogPostPhotos/${file.name}`)
      docRef.put(file).on(
        "state_changed",
        () => {
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
          //Insert the acquired picture URL into the mouse back to look back
          Editor.insertEmbed(cursorLocation,"image", downloadURL);
          resetUploader();
        }
      );
    },

    uploadBlog() {
      if ((this.blogTitle.length !== 0) && (this.blogHTML.length !== 0)) {
        if (this.file) {
          this.loading = true;
          const storageRef = firebase.storage().ref();
          const docRef = storageRef.child(`documents/blogCoverPhotos/${this.$store.state.blogPhotoName}`);
          //Completion observer, called on successful completion
          docRef.put(this.file).on(
            "state_changed",
            (snapshot) => {
              console.log(snapshot);
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
              const timestamp = await Date.now();
              //Use an unique ID for the returned DocumentReference(文檔參考)
              const dataBase = await db.collection("blogPosts").doc();
              await dataBase.set({
                blogID: dataBase.id,
                blogHTML: this.blogHTML,
                blogCoverPhoto: downloadURL,
                blogCoverPhotoName: this.blogCoverPhotoName,
                blogTitle: this.blogTitle,
                profileId: this.profileId,
                date: timestamp
              });
              await this.$store.dispatch("getPost");
              this.loading = false;
              this.$router.push({ name: "ViewBlog",params: { blogid : dataBase.id} });
            }
          );
          return;
        }
        this.error = true;
        this.errorMsg = "Please ensure you upload a cover photo!";
        setTimeout(() => {
          this.error = false;
        }, 5000);
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
  beforeRouteLeave (to, from, next) {
    if(to.name === 'BlogPreview') {
      from.meta.keepAlive = true;
      next();
      return
    }
    from.meta.keepAlive = false;
    next();
  }
}
</script>

<style lang="scss">
.create-post {
  position: relative;
  height: 100%;
  button {
    margin-top: 0;
  }

  .router-button {
    text-decoration: none;
    color: #fff;
  }

  label,
  button,
  .router-button {
    align-self: center;
    padding: 12px 24px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 28px;
    color: #fff;
    background-color: #303030;
    transition: .5s ease-in-out all;

    &:hover {
      @media (min-width: 900px) {
        background-color: rgba(48, 48, 48, .7);
      }
    }
  }

  .container {
    position: relative;
    height: 100%;
    padding: 16px 25px 10px;
    @media (min-width: 900px) {
      padding: 16px 25px 60px;
    }
  }

// error styling
  .invisible {
    opacity: 0  !important;
  }

  .err-message {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    color: #fff;
    margin-top: 10px;
    background-color: #303030;
    opacity: 1;
    transition: .5s ease all;
    p {
      font-size: 14px;
    }

    span {
      font-weight: 600;
    }
  }

  .blog-info {
    display: flex;
    flex-wrap: wrap;
    margin-top: 16px;
    margin-bottom: 16px;
    @media (min-width: 900px) {
      margin-bottom: 32px;
    }

    input:nth-child(1) {
      min-width:280px;
      @media (min-width: 900px) {
        min-width: 350px;
      }
    }

    input {
      transition: .5s ease-in-out all;
      padding: 10px 4px;
      border: none;
      border-bottom: 1px solid #303030;

      &:focus {
        outline: none;
        box-shadow: 0 1px 0 0 #303030;
      }
    }

    .upload-file {
      flex: 1;
      position: relative;
      display: flex;
      flex-wrap: wrap;
      label {
        margin-top: 16px;
        flex: 0 2 auto;
        background-color: #fff;
        @media (min-width: 900px) {
          background-color: #303030;
          margin-left: 16px;
          margin-top: 0;
        }
      }
      input {
        display: none;
      }

      .preview {
        text-transform: initial;
        margin-top: 16px;
        flex: 0 1 auto;
        background-color: #fff;
        @media (min-width: 900px) {
          display: block;
          background-color: #303030 ;
          margin-left: 16px;
          margin-top: unset;
        }
      }

      span {
        font-size: 12px;
        flex: 0 1 auto;
        align-self: center;
        margin-top: 16px;
        @media (min-width: 900px) {
          margin-left: 16px;
          margin-top: unset;
        }
      }

      .icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        transition: .5s ease all;
        @media (min-width: 900px) {
          display: none;
        }
      }
    }  
  }

  .enditor {
    width: 100%;
    height: 80vh;
    display: flex;
    flex-direction: column;
    @media (min-width: 900px) {
      width: 90%;
    }
    .quillWrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .ql-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: auto;
    }

    .ql-editor {
      padding: 20px 16px 30px;
    }
  }

  .blog-actions {
    margin-top: 32px;
    display: flex;
    @media (mix-width: 900px) {
      margin-top: 16px;
    }
    button {
      margin-right: 16px;
    }

    .router-button {
      margin-top: 0;
    }
  }
}
</style>