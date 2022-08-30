var DataTypes = require("sequelize").DataTypes;
var _branch = require("./branch");
var _category = require("./category");
var _product = require("./product");
var _report_display = require("./report_display");
var _report_product = require("./report_product");
var _store = require("./store");
var _surveyor = require("./surveyor");

function initModels(sequelize) {
  var branch = _branch(sequelize, DataTypes);
  var category = _category(sequelize, DataTypes);
  var product = _product(sequelize, DataTypes);
  var report_display = _report_display(sequelize, DataTypes);
  var report_product = _report_product(sequelize, DataTypes)
  var store = _store(sequelize, DataTypes);
  var surveyor = _surveyor(sequelize, DataTypes);

  store.belongsTo(branch, { as: "branch", foreignKey: "branch_id"});
  branch.hasMany(store, { as: "stores", foreignKey: "branch_id"});
  product.belongsTo(category, { as: "category", foreignKey: "category_id"});
  category.hasMany(product, { as: "products", foreignKey: "category_id"});
  report_display.belongsTo(category, { as: "category", foreignKey: "category_id"});
  category.hasMany(report_display, { as: "report_displays", foreignKey: "category_id"});
  report_display.belongsTo(store, { as: "store", foreignKey: "store_id"});
  store.hasMany(report_display, { as: "report_displays", foreignKey: "store_id"});
  report_display.belongsTo(surveyor, { as: "surveyor", foreignKey: "surveyor_id"});
  surveyor.hasMany(report_display, { as: "report_displays", foreignKey: "surveyor_id"});
  product.hasMany(report_product, {as: "report_product", foreignKey: "product_id"});
  report_product.belongsTo(product, { as: "product", foreignKey: "product_id" });


  return {
    branch,
    category,
    product,
    report_display,
    report_product,
    store,
    surveyor,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
