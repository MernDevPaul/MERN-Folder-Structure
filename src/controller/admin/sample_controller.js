const express = require("express");
const BaseController = require("../base_controller");
const sample = require("../../models/sample_model");

class SampleController extends BaseController {
  constructor() {
    super();
    this.model = sample;
    this.router = express.Router();
    this.router.post(
      "/",
      this.uploadSingle("image"),
      this.asyncHandler(this.createHandler)
    );
    this.router.put(
      "/:id",
      this.uploadSingle("image"),
      this.asyncHandler(this.updateHandler)
    );
    this.router.delete("/:id", this.asyncHandler(this.deleteHandler));
    this.router.delete("/", this.asyncHandler(this.deleteManyHandler));
    this.router.get("/:id", this.asyncHandler(this.getSingle));
    this.router.get("/", this.asyncHandler(this.getAll));
  }

  createHandler = async (req, res) => {
    try {
      const imageData = req.file ? req.file.path : undefined;
      const createdData = await this.create(this.model, {
        ...req.body,
        image: imageData,
      });
      this.success(res, 201, true, "Create Successfully", createdData);
    } catch (error) {
      throw new Error(error);
    }
  };

  updateHandler = async (req, res) => {
    try {
      const { id } = req.params;
      this.validateId(id);
      const check = await this.findOne(this.model, { _id: id });
      if (!check) {
        throw new Error("Data not found");
      }
      const imageData = req.file ? req.file.path : undefined;
      const updatedData = await this.update(
        this.model,
        { _id: id },
        { $set: { ...req.body, image: imageData } },
        { new: true }
      );
      this.success(res, 200, true, "Update Successfully", updatedData);
    } catch (error) {
      throw new Error(error);
    }
  };

  deleteHandler = async (req, res) => {
    try {
      const { id } = req.params;
      this.validateId(id);
      const check = await this.findOne(this.model, { _id: id });
      if (!check) {
        throw new Error("Data not found");
      }
      const deletedData = await this.delete(this.model, { _id: id });
      this.success(res, 200, true, "Delete Successfully", deletedData);
    } catch (error) {
      throw new Error(error);
    }
  };

  deleteManyHandler = async (req, res) => {
    try {
      const { ids } = req.body;
      const objectIdsToDelete = ids.map(
        (id) => new this.mongoose.Types.ObjectId(id)
      );
      const deletedData = await this.deleteMany(this.model, {
        _id: { $in: objectIdsToDelete },
      });
      this.success(res, 200, true, "Delete Successfully", deletedData);
    } catch (error) {
      throw new Error(error);
    }
  };

  getSingle = async (req, res) => {
    try {
      const { id } = req.params;
      this.validateId(id);
      const check = await this.findOne(this.model, { _id: id });
      if (!check) {
        throw new Error("Data not found");
      }
      this.success(res, 200, true, "Get Successfully", check);
    } catch (error) {
      throw new Error(error);
    }
  };

  getAll = async (req, res) => {
    try {
      const data = await this.find(this.model, { ...req.query });
      this.success(res, 200, true, "Get Successfully", data);
    } catch (error) {
      throw new Error(error);
    }
  };
}

module.exports = new SampleController().router;
