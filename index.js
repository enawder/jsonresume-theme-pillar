var fs = require("fs");
var path = require('path');
var Handlebars = require("handlebars");
var helpers = require("handlebars-helpers")({
  handlebars: Handlebars
});

function getTranslations() {
  var translations = {};
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

function render(resume) {
  var colorscheme = resume.meta.colorscheme;
  var css = fs.readFileSync(
    __dirname + "/public/assets/css/" + colorscheme + ".css", "utf-8");
  var template = fs.readFileSync(__dirname + "/src/index.hbs", "utf-8");
  var partialsDir = path.join(__dirname, '/src/partials');
  var filenames = fs.readdirSync(partialsDir);

  filenames.forEach(function (filename) {
    var matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
      return;
    }
    var name = matches[1];
    var filepath = path.join(partialsDir, filename)
    var template = fs.readFileSync(filepath, 'utf8');

    Handlebars.registerPartial(name, template);
  });
  Handlebars.registerHelper("skillLevelToPercent", skillLevelToPercentHelper)
  var options = {
    css: css,
    resume: resume,
    language: resume.meta.language || "en"
  }
  Object.assign(options, getTranslations())
  return Handlebars.compile(template)(options);
}

module.exports = {
  render: render
};
