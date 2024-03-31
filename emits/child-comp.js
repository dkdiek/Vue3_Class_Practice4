export default {
  props: {
    msg: String,
  },
  template: `
        <h2>{{msg}}</h2>
        <button @click="you">you</button>

    `,
  setup(props, { emit }) {
    function you() {
      emit("response", "Tom");
    }
    return {
      you,
    };
  },
};
