const State = require('../models/State');
const validateStateCode = require("../middleware/validateStateCode");
const statesData = require('../models/statesData.json');

const verifyStateCode = async (req, res, next) => {
    const stateCode = req.params.state;
    const isValidStateCode = validateStateCode(stateCode);

    return isValidStateCode 
        ? next() 
        : res.json({ message: "Invalid state abbreviation parameter" });
};

/* 
    params: stateData - an array of state objects
*/
const addFunFacts = async (stateData) => {
    const stateDataWithFunFacts = stateData.map(async s => {
        const stateDBData = await State.findOne({ stateCode: s.code }).exec();
        const funfacts = stateDBData?.funfacts ? stateDBData.funfacts : [];
        return funfacts.length ? { ...s, funfacts } : s;
    });

    return await Promise.all(stateDataWithFunFacts);
};

const getAllStates = async (req, res, next) => {
    const isContiguous = req.query.contig;

    if (isContiguous === undefined) {
        // Return a list of all states
        const stateDataWithFunFacts = await addFunFacts(statesData);
        res.json(stateDataWithFunFacts);
    } else
        next();
};

const getStatesByContiguity = async (req, res) => {
    const isContiguous = req.query.contig === "true";

    const stateData = statesData.filter(s => isContiguous 
        ? !['AK', 'HI'].includes(s.code) 
        : ['AK', 'HI'].includes(s.code)
    );

    // Return a list of contiguous or non-contiguous states
    const stateDataWithFunFacts = await addFunFacts(stateData);
    res.json(stateDataWithFunFacts);
};

const getStateInfo = async (req, res) => {
    const stateCode = req.params.state;

    // Return information about the specified state
    const stateData = statesData.filter(s => s.code === stateCode.toUpperCase());
    const stateDataWithFunFacts = (await addFunFacts(stateData))[0];
    res.json(stateDataWithFunFacts);
};

const getFunFact = async (req, res) => {
    const stateCode = req.params.state;
    const stateDBData = await State.findOne({ stateCode: stateCode.toUpperCase() }).exec();
    const funfactsArr = stateDBData?.funfacts ? stateDBData.funfacts : [];
    const randomIndex = Math.floor(Math.random() * funfactsArr.length);

    const stateData = statesData.find(s => s.code === stateCode.toUpperCase());

    // Return a fun fact about the specified state
    res.json(
        funfactsArr.length 
        ? { funfact: funfactsArr[randomIndex]} 
        : { message: `No Fun Facts found for ${stateData.state}`}
    );
};

const getCapital = async (req, res) => {
    const stateCode = req.params.state;

    const stateData = statesData.find(s => s.code === stateCode.toUpperCase());
    const stateCapital = {
        state: stateData.state,
        capital: stateData.capital_city
    };

    // Return the capital of the specified state
    res.json(stateCapital);
};

const getNickname = async (req, res) => {
    const stateCode = req.params.state;

    const stateData = statesData.find(s => s.code === stateCode.toUpperCase());
    const stateNickname = {
        state: stateData.state,
        nickname: stateData.nickname
    };

    // Return the nickname of the specified state
    res.json(stateNickname);
};

const getPopulation = async (req, res) => {
    const stateCode = req.params.state;

    const stateData = statesData.find(s => s.code === stateCode.toUpperCase());
    const statePopulation = {
        state: stateData.state,
        population: stateData.population.toLocaleString()
    };

    // Return the population of the specified state
    res.json(statePopulation);
};

const getAdmissionDate = async (req, res) => {
    const stateCode = req.params.state;

    const stateData = statesData.find(s => s.code === stateCode.toUpperCase());
    const stateAdmission = {
        state: stateData.state,
        admitted: stateData.admission_date
    };

    // Return the date of admission to the Union for the specified state
    res.json(stateAdmission);
};

const postFunFact = async (req, res) => {
    const stateCode = req.params.state;
    const funfactsBodyArr = req.body.funfacts;

    if (!funfactsBodyArr)
        return res.status(400).json({ message: "State fun facts value required" });

    if (!Array.isArray(funfactsBodyArr))
        return res.status(400).json({ message: "State fun facts value must be an array" });

    let state = await State.findOne({ stateCode: stateCode.toUpperCase() }).exec();

    // if state does NOT exists, add MongoDB document
    if (!state) {
        state = await State.create({
            stateCode: stateCode.toUpperCase(),
            funfacts: funfactsBodyArr
        });
    } else {
        // if state exists, update MongoDB document
        state.funfacts = [...state.funfacts, ...funfactsBodyArr];
        state.save();
    }

    res.status(201).json(state);
};

const patchFunFact = async (req, res) => {
    const stateCode = req.params.state;
    const funfactsBodyStr = req.body.funfact;
    let index = req.body.index;
    let validIndex = false;

    try {
        index = parseInt(index);
        validIndex = index > 0;;
    } catch (e) {
        validIndex = false;
    }
    
    if (!validIndex)
        return res.status(400).json({ message: "State fun fact index value required" });

    if (!funfactsBodyStr || typeof funfactsBodyStr !== "string")
        return res.status(400).json({ message: "State fun fact value required" });

    const state = await State.findOne({ stateCode: stateCode.toUpperCase() }).exec();
    const funfactsArr = state?.funfacts ? state.funfacts : [];
    const stateData = statesData.find(s => s.code === stateCode.toUpperCase());

    if (!funfactsArr.length)
        return res.status(400).json({ message: `No Fun Facts found for ${stateData.state}`});

    if (index > funfactsArr.length)
        return res.status(400).json({ message: `No Fun Fact found at that index for ${stateData.state}`});

    funfactsArr[index - 1] = funfactsBodyStr;
    state.funfacts = funfactsArr;
    state.save();

    res.json(state);
};

const deleteFunFact = async (req, res) => {
    const stateCode = req.params.state;
    let index = req.body.index;
    let validIndex = false;

    try {
        index = parseInt(index);
        validIndex = index > 0;;
    } catch (e) {
        validIndex = false;
    }

    if (!validIndex)
        return res.status(400).json({ message: "State fun fact index value required" });

    const state = await State.findOne({ stateCode: stateCode.toUpperCase() }).exec();
    const funfactsArr = state?.funfacts ? state.funfacts : [];
    const stateData = statesData.find(s => s.code === stateCode.toUpperCase());

    if (!funfactsArr.length)
        return res.status(400).json({ message: `No Fun Facts found for ${stateData.state}`});

    if (index > funfactsArr.length)
        return res.status(400).json({ message: `No Fun Fact found at that index for ${stateData.state}`});

    funfactsArr.splice(index - 1, 1);
    state.funfacts = funfactsArr;
    const updatedState = await state.save();

    res.json(updatedState);
};

module.exports = {
    verifyStateCode,
    getAllStates,
    getStatesByContiguity,
    getStateInfo,
    getFunFact,
    getCapital,
    getNickname,
    getPopulation,
    getAdmissionDate,
    postFunFact,
    patchFunFact,
    deleteFunFact
};