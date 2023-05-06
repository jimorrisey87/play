const express = require("express");
const stateRouter = express.Router();
const statesController = require("../controllers/statesController");

// Route for /states/
stateRouter.get("/", statesController.getAllStates);

// Route for /states/?contig=true
stateRouter.get("/", statesController.getStatesByContiguity);

// Verify :state is a valid state code
stateRouter.all("/:state*", statesController.verifyStateCode);

// Route for /states/:state
stateRouter.get("/:state", statesController.getStateInfo);

// Route for /states/:state/funfact
stateRouter.get("/:state/funfact", statesController.getFunFact);
stateRouter.post("/:state/funfact", statesController.postFunFact);
stateRouter.patch("/:state/funfact", statesController.patchFunFact);
stateRouter.delete("/:state/funfact", statesController.deleteFunFact);

// Route for /states/:state/capital
stateRouter.get("/:state/capital", statesController.getCapital);

// Route for /states/:state/nickname
stateRouter.get("/:state/nickname", statesController.getNickname);

// Route for /states/:state/population
stateRouter.get("/:state/population", statesController.getPopulation);

// Route for /states/:state/admission
stateRouter.get("/:state/admission", statesController.getAdmissionDate);

module.exports = stateRouter;