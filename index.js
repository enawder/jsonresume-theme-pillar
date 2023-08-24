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

function locationToStringHelper(loc) {
  return [
    loc.address || "",
    loc.postalCode || "",
    loc.city || "",
    loc.region || "",
    loc.countryCode || ""
  ].filter(item => item).join(", ")
}

function languageFromLocaleHelper(locale) {
    const languages = {
      'en': 'English',
      'fr': 'Français'
    };
    if (!languages.hasOwnProperty(locale))
      throw new Error("Unknown locale ${locale} !");
    return languages[locale];
}

function registerHelpers() {
  handlebars.registerHelper("skillLevelToPercent", skillLevelToPercentHelper)
  handlebars.registerHelper("locationToString", locationToStringHelper)
  handlebars.registerHelper("languageFromLocale", languageFromLocaleHelper)
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

  registerPartials(path.join(viewsPath, "partials"));
  registerPartials(path.join(viewsPath, "components"));
  registerHelpers();

  return handlebars.compile(template)({
    resume: resume,
    style: css,
    scripts: resume.meta.scripts || [],
    language: resume.meta.language || "en",
    ...getTranslations()
  });
}

module.exports = {
  render: render,
  pdfRenderOptions: {
    mediaType: "print",
    format: "A4",
    landscape: false,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    printBackground: true,
    scale: 0.7
  }
};
