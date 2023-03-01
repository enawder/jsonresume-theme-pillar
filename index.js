var fs = require("fs");
var path = require('path');
var Handlebars = require("handlebars");

function render(resume) {
  var colorscheme = resume.meta.colorscheme;
  var css = fs.readFileSync(
    __dirname + "/src/pillar-theme/assets/css/" + colorscheme + ".css", "utf-8");
  var tpl = fs.readFileSync(__dirname + "/src/index.hbs", "utf-8");
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
  return Handlebars.compile(tpl)({
    css: css,
    resume: resume
  });
}

module.exports = {
  render: render
};
