const express = require("express");
const { check } = require("express-validator");

const customersController = require("../controllers/customers-controllers");

const router = express.Router();

// to get the customer list
router.get("/", customersController.getCustomers);

// to get single customer
router.get("/:customerId", customersController.getCustomer);

// to add a new customer
router.post(
  "/customer-add",
  [
    check("name").not().isEmpty(),
    check("address").not().isEmpty(),
    check("identityNum").not().isEmpty(),
    check("contactNum").not().isEmpty(),
    check("noOfGuest").not().isEmpty(),
    check("checkInDate").not().isEmpty(),
    check("checkOutDate").not().isEmpty(),
  ],
  customersController.addCustomer
);

// to edit an existing customer
router.patch(
  "/customer-edit/:customerId",
  [
    check("name").not().isEmpty(),
    check("address").not().isEmpty(),
    check("identityNum").not().isEmpty(),
    check("contactNum").not().isEmpty(),
    check("noOfGuest").not().isEmpty(),
    check("checkInDate").not().isEmpty(),
    check("checkOutDate").not().isEmpty(),
  ],
  customersController.editCustomer
);

// to delete single customer
router.delete("/:customerId", customersController.deleteCustomer);

module.exports = router;
