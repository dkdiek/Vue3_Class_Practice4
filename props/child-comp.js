export default {
  props: {
    msg: String,
    person: String,
  },
  template: `
        <h1>{{msg}}{{person}}</h1>
    `,
};
