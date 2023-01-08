const { validationResult } = require("express-validator");

const Customer = require("../models/customer");

// to get the customer list
const getCustomers = async (req, res, next) => {
  let customers;
  try {
    customers = await Customer.find({});
  } catch (err) {
    return res.status(500).json({
      message: "Fetching customers failed, please try again later.",
    });
  }
  res.json({
    customers: customers.map((customer) => {
      let finalCustomerData = customer.toObject({ getters: true });
      return {
        ...finalCustomerData,
        checkInDate: convertDate(finalCustomerData.checkInDate),
        checkOutDate: convertDate(finalCustomerData.checkOutDate),
      };
    }),
  });
};

// to get single customer
const getCustomer = async (req, res, next) => {
  let customerId = req.params.customerId;
  let customer;
  try {
    customer = await Customer.find({ _id: customerId });
  } catch (err) {
    return res.status(500).json({
      message: "Fetching customer failed, please try again later.",
    });
  }

  let finalCustomerData = customer[0].toObject({ getters: true });

  res.json({
    customer: {
      ...finalCustomerData,
      checkInDate: convertDate(finalCustomerData.checkInDate),
      checkOutDate: convertDate(finalCustomerData.checkOutDate),
    },
  });
};

// to add a new customer
const addCustomer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Invalid inputs passed, please check your data.",
    });
  }

  const {
    name,
    address,
    identityNum,
    contactNum,
    noOfGuest,
    checkInDate,
    checkOutDate,
  } = req.body;

  let existingCustomer;
  try {
    existingCustomer = await Customer.findOne({
      contactNum,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Customer creation failed, please check your data.",
    });
  }

  if (existingCustomer) {
    return res.status(422).json({
      message: "Booking exists already, please check with admin",
    });
  }

  const createdCustomer = new Customer({
    name,
    address,
    identityNum,
    contactNum,
    noOfGuest,
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
  });

  try {
    await createdCustomer.save();
  } catch (err) {
    return res.status(500).json({
      message: "Customer creation failed, please check your data.",
    });
  }

  res.status(201).json({
    customerId: createdCustomer.id,
    name: createdCustomer.name,
    address: createdCustomer.address,
    identityNum: createdCustomer.identityNum,
    contactNum: createdCustomer.contactNum,
    noOfGuest: createdCustomer.noOfGuest,
    checkInDate: convertDate(createdCustomer.checkInDate),
    checkOutDate: convertDate(createdCustomer.checkOutDate),
  });
};

// date convert helper function
convertDate = (inputFormat) => {
  function pad(s) {
    return s < 10 ? "0" + s : s;
  }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join("/");
};

// to edit an existing customer
const editCustomer = async (req, res, next) => {
  let customerId = req.params.customerId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Invalid inputs passed, please check your data.",
    });
  }

  const {
    name,
    address,
    identityNum,
    contactNum,
    noOfGuest,
    checkInDate,
    checkOutDate,
  } = req.body;

  const updatedCustomer = {
    name,
    address,
    identityNum,
    contactNum,
    noOfGuest,
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
  };

  try {
    const query = { _id: customerId };
    const update = { $set: updatedCustomer };
    const options = {};
    await Customer.updateOne(query, update, options);
  } catch (err) {
    return res.status(500).json({
      message: "Customer updation failed, please check your data.",
    });
  }

  res.status(200).json({
    message: "Customer updated successfully",
  });
};

// to delete an existing customer
const deleteCustomer = async (req, res, next) => {
  let customerId = req.params.customerId;

  let customer;
  try {
    const query = { _id: customerId };
    const result = await Customer.deleteOne(query);
    if (result.deletedCount === 1) {
      res.status(200).json({
        message: "Customer deleted successfully.",
      });
    } else {
      res.status(400).json({
        message: "There is no customer for this ID. Nothing to delete!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Fetching customer failed, please try again later.",
    });
  }
};

exports.getCustomers = getCustomers;
exports.getCustomer = getCustomer;
exports.addCustomer = addCustomer;
exports.editCustomer = editCustomer;
exports.deleteCustomer = deleteCustomer;
