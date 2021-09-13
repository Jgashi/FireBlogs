module.exports = {
  chainWebpack: (config) => {
    //By default Vue CLI uses the file-loader to process the SVG files, you can replace it in vue.config.js
    const svgRule = config.module.rule("svg");

    svgRule.uses.clear();

    svgRule
      .use("babel-loader")
      .loader("babel-loader")
      .end()
      .use("vue-svg-loader")
      .loader("vue-svg-loader");
  },
};
