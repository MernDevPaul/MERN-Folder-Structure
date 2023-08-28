const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const config = require("./config");
const mongoose = require("mongoose");
const Admin = require("../models/admin_model");
const multer = require("multer");
const { admin } = require("../utils/init");
const asyncHandler = require("express-async-handler");
class Service {
  constructor() {
    this.model = null;
    this.admin = Admin;
    this.jwt = jwt;
    this.nodemailer = nodemailer;
    this.config = config;
    this.mongoose = mongoose;
    this.asyncHandler = asyncHandler;
  }
  async create(model, data) {
    try {
      const createdItem = await model.create(data);
      return createdItem;
    } catch (error) {
      throw error;
    }
  }

  async createMany(model, data) {
    try {
      const createdItems = await model.insertMany(data);
      return createdItems;
    } catch (error) {
      throw error;
    }
  }

  async update(model, conditions, update, options) {
    try {
      const updatedItem = await model.findOneAndUpdate(
        conditions,
        update,
        options
      );
      return updatedItem;
    } catch (error) {
      throw error;
    }
  }

  async updateById(model, id, update, options) {
    try {
      const updatedItem = await model.findByIdAndUpdate(id, update, options);
      return updatedItem;
    } catch (error) {
      throw error;
    }
  }

  async updateMany(model, conditions, update, options) {
    try {
      const updateResult = await model.updateMany(conditions, update, options);
      return updateResult;
    } catch (error) {
      throw error;
    }
  }

  async delete(model, conditions) {
    try {
      const deletedItem = await model.findOneAndDelete(conditions);
      return deletedItem;
    } catch (error) {
      throw error;
    }
  }

  async deleteById(model, id) {
    try {
      const deletedItem = await model.findByIdAndDelete(id);
      return deletedItem;
    } catch (error) {
      throw error;
    }
  }

  async deleteMany(model, conditions) {
    try {
      const deleteResult = await model.deleteMany(conditions);
      return deleteResult;
    } catch (error) {
      throw error;
    }
  }

  async findOne(model, query, projection, extension = {}) {
    const { options, populate } = extension;
    try {
      const foundItem = await model
        .findOne(query, projection, options)
        .populate(populate)
        .exec();
      return foundItem;
    } catch (error) {
      throw error;
    }
  }

  async findOneById(model, id, projection, extension = {}) {
    const { options, populate } = extension;
    try {
      const foundItem = await model
        .findById(id, projection, options)
        .populate(populate)
        .exec();
      return foundItem;
    } catch (error) {
      throw error;
    }
  }

  async find(model, query, projection, extension = {}) {
    const { populate, sort, limit, options, count } = extension;
    try {
      let queryObj = model.find(query, projection, options);
      if (populate) queryObj = queryObj.populate(populate);
      if (sort) queryObj = queryObj.sort(sort);
      if (limit) queryObj = queryObj.limit(limit);

      const execQuery = queryObj.exec();
      if (count) {
        const countResult = this.model.countDocuments(query);
        const [data, count] = await Promise.all([execQuery, countResult]);
        return { data, count };
      }
      return execQuery;
    } catch (error) {
      throw error;
    }
  }

  async getAggregation(model, query, extension = {}) {
    const { populate } = extension;
    try {
      let aggregation = model.aggregate(query);
      if (populate) aggregation = aggregation.populate({ path: populate });
      return aggregation.exec();
    } catch (error) {
      throw error;
    }
  }

  async getCount(model, conditions) {
    try {
      const count = await model.countDocuments(conditions);
      return count;
    } catch (error) {
      throw error;
    }
  }

  async createToken(id) {
    try {
      const token = await this.jwt.sign({ id }, this.config.JWT_SECRET, {
        expiresIn: "30d",
      });
      return token;
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const decodedToken = this.jwt.verify(token, this.config.JWT_SECRET);
      return decodedToken;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  uploadSingle(image) {
    let storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "public/uploads");
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + Math.random() + ".webp");
      },
    });
    let upload = multer({ storage: storage });
    return upload.single(image);
  }

  uploadMultiple(image) {
    let storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "public/uploads");
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + Math.random() + ".webp");
      },
    });
    let upload = multer({ storage: storage });
    return upload.array(image);
  }

  async success(res, status, success, message, data, token) {
    res.statusMessage = message;
    res.status(status).json({ status, success, message, data, token }).end();
  }

  async error(res, status, error, message) {
    res.statusMessage = message;
    res.status(status).json({ status, error, message }).end();
  }

  async sendMail(options) {
    try {
      const transporter = nodemailer.createTransport({
        host: this.config.SMPT_HOST,
        port: this.config.SMPT_PORT,
        service: this.config.SMPT_SERVICE,
        auth: {
          user: this.config.SMPT_MAIL,
          pass: this.config.SMPT_PASSWORD,
        },
      });

      const mailOptions = {
        from: this.config.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        html: options.message,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw error;
    }
  }

  async validateId(id, meg) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new Error(`${meg ?? "This id"} is Invalid!`);
  }

  async dbConnect() {
    try {
      await mongoose.connect(config.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`DB connected successfully ${config.MONGO_URI}`);
    } catch (error) {
      console.error(`DB connection error: ${error.message}`);
    }
  }

  async init() {
    const check_admin = await this.admin.find().countDocuments();
    if (check_admin < 1) {
      await this.create(this.admin, admin[0]);
    }
  }

  async auth(req, res, next) {
    try {
      const token = req?.headers?.authorization?.split(" ")[1];
      if (!token) {
        throw new Error("Unauthorized");
      }
      const decoded = await this.verifyToken(token);
      if (!decoded) {
        throw new Error("Invalid token");
      }
      const verify_admin = await this.admin.findOne({ _id: decoded.id });
      if (!verify_admin) {
        throw new Error("Unauthorized");
      }
      req.admin = verify_admin;
      next();
    } catch (error) {
      this.error(res, 401, true, error.message);
    }
  }
}

module.exports = Service;
