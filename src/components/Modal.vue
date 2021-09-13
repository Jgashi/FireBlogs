<template>
  <div class="modal">
    <div class="modal-content">
      <p>{{this.modalMessage}}</p>
      <button v-if="acceptButton" @click="accept">accept</button>
      <button @click="closeModal">Close</button>
    </div>
  </div>
</template>
<script>
export default {
  props: ["modalMessage","acceptButton"],
  methods: {
    closeModal() {
      this.$emit("close-modal");
    },
    accept() {
      this.$emit("accept");
    }
  },
}
</script>

<style lang="scss" scoped>
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 101;
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, .7);

  .modal-content {
    width: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 8px;
    padding: 40px 30px;
    background-color: #fff;

    p {
      text-align: center;
    }

    button {
      align-self: center;
    }
  }
}
</style>