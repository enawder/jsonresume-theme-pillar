const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const helpers = require("handlebars-helpers")({
  handlebars: handlebars
});

function getTranslations() {
  let translations = {};
  const i18nPath = path.join(__dirname, "/src/i18n")
  const files = fs.readdirSync(i18nPath)
    .filter(file => path.extname(file) === ".json")
  files.forEach(file => {
    const data = fs.readFileSync(path.join(i18nPath, file));
    const language = path.parse(file).name;
    translations[language] = JSON.parse(data);
  })
  return translations;
}

function skillLevelToPercentHelper(level) {
  switch (level.toLowerCase()) {
    case "master":
      return 100;
    case "advanced":
      return 75;
    case "intermediate":
      return 50;
    case "beginner":
      return 25;
    default:
      return 0;
  }
}

function registerHelpers() {
  handlebars.registerHelper("skillLevelToPercent", skillLevelToPercentHelper)
}

function registerPartials(partialsPath) {
  const filenames = fs.readdirSync(partialsPath);
  filenames.forEach(function (filename) {
  const filenames = fs.readdirSync(partialsPath);
    const matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
      return;
    }
    const name = matches[1];
    const filepath = path.join(partialsPath, filename)
    const partial = fs.readFileSync(filepath, "utf-8");

    handlebars.registerPartial(name, partial);
  });
}

function render(resume) {
  const env = process.env.ENV || "prod";
  const colorscheme = resume.meta.colorscheme;
  const css =
    fs.readFileSync(
      path.join(__dirname, "public", env, "assets", "css", colorscheme + ".css"),
      "utf-8"
    );
  const viewsPath = path.join(__dirname, "src", "views");
  const template = fs.readFileSync(path.join(viewsPath, "index.hbs"), "utf-8");
  const partialsPath = path.join(viewsPath, "partials");

  registerPartials(partialsPath);
  registerHelpers();

  return handlebars.compile(template)({
    style: css,
    resume: resume,
    language: resume.meta.language || "en",
    ...getTranslations()
  });
}

module.exports = {
  render: render
};
