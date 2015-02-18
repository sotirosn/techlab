mongoexport --db techlab --collection users >> techlab.users.json
mongoexport --db techlab --collection assignments >> techlab.assignments.json
mongoexport --db techlab --collection projects >> techlab.projects.json
mongoexport --db techlab --collection files >> techlab.files.json

