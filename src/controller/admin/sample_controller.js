const express = require("express");
const BaseController = require("../base_controller");
const sample = require("../../models/sample_model");

class SampleController extends BaseController {
  constructor() {
    super();
    this.model = sample;
    this.router = express.Router();
    this.router.post("/", this.uploadSingle('image'), this.asyncHandler(this.createHandler));
    this.router.put("/:id", this.uploadSingle('image'), this.asyncHandler(this.updateHandler));
    this.router.delete("/:id", this.asyncHandler(this.deleteHandler));
    this.router.delete("/", this.asyncHandler(this.deleteManyHandler));
    this.router.get("/:id", this.asyncHandler(this.getSingle));
    this.router.get("/", this.asyncHandler(this.getAll));
  }
  createHandler = async (req, res) => {
    var _a;
    const createdData = await this.create(this.model, {...req.body,image:(_a = req.file) === null || _a === void 0 ? void 0 : _a.path});
    this.success(res, 201, true, "Create Successfully", createdData);
  };
  updateHandler = async (req, res) => {
    var _a;
    const { id } = req.params;
    this.validateId(id);
    const check = await this.findOne(this.model, { _id: id });
    if (!check) throw new Error("Not found");
    const updatedData = await this.update(this.model, { _id: id }, {$set:{...req.body,image:(_a = req.file) === null || _a === void 0 ? void 0 : _a.path}}, {upsert: true, new: true});
    this.success(res, 200, true, "Update Successfully", updatedData);
  };
  deleteHandler = async (req, res) => {
    const { id } = req.params;
    this.validateId(id);
    const check = await this.findOne(this.model, { _id: id });
    if (!check) throw new Error("Not found");
    const deletedData = await this.delete(this.model, { _id: id });
    this.success(res, 200, true, "Delete Successfully", deletedData);
  }
  deleteManyHandler = async (req, res) => {
    const { ids } = req.body;
    const objectIdsToDelete = ids.map((id) => new this.mongoose.Types.ObjectId(id));
    const deletedData = await this.deleteMany(this.model, { _id: {$in:objectIdsToDelete} });
    this.success(res, 200, true, "Delete Successfully", deletedData);
  }
  getSingle = async (req, res) => {
    const { id } = req.params;
    this.validateId(id);
    const check = await this.findOne(this.model, { _id: id });
    if (!check) throw new Error("Not found");
    this.success(res, 200, true, "Get Successfully", check);
  }
  getAll = async (req, res) => {
    const data = await this.find(this.model,{...req.query});
    this.success(res, 200, true, "Get Successfully", data);
  }
};


module.exports = new SampleController().router;

