const axios = require("axios");

const playerList = ["2e289710723b27949296f5ad3152027ecb6061f1"];
const miner_id_list = [];
let playerPointer = 0;
let minerPointer = 0;
let currentLastProof, prevLastProof, difficulty;

const getLastProof = player_id => {
  // request proof from server
  const token = "Token " + player_id;
  axios({
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: token
    },
    url: "https://lambda-treasure-hunt.herokuapp.com/api/bc/last_proof/"
  })
    .then(results => {
      if (results.data.proof !== currentLastProof) {
        prevLastProof = currentLastProof;
        currentLastProof = results.data.proof;
        difficulty = results.data.difficulty;
      }
    })
    .catch(err => {
      console.log(err);
    });
};

const manageLastProofRequest = () => {
  // invoke this function every 10 seconds
  if (playerList.length > 0) {
    getLastProof(playerList[playerPointer++]);
    playerPointer = playerPointer % playerList.length;
  }
};

getLastProof(playerList[0]);
// setInterval(manageLastProofRequest, 10000);

const getTotalMiners = (req, res) => {
  const total_miners = playerList.length;
  res.status(200).json({ total_miners });
};

// post
const manageMiners = (req, res) => {
  const { step, player_id: id } = req.body;
  const max = playerList.length;
  const range = 10000000000;
  const results = id * range + step * max * range;
  res.status(200).json({ results, range });
};

// post
const addPlayer = async (req, res) => {
  const { player_id } = req.body;
  playerList.push(player_id);
  res.send("player id added to player list");
};

// get
const getMinerID = async (req, res) => {
  const miner_id = miner_id_list.length;
  miner_id_list.push(miner_id);
  res.status(200).json({ miner_id });
};

const mineLastProof = async (req, res) => {
  // get last proof from server
  // get based on timer
  res.send("sanity check");
};

const getProof = (req, res) => {
  res.status(200).json({ proof: currentLastProof, difficulty });
};

const submitProof = (req, res) => {
  const { proof: new_proof } = req.body;
  const player_id = playerList[minerPointer++];
  minerPointer = minerPointer % playerList.length;
  const token = "Token " + player_id;
  //   res.status(200).json({ player_id: token });
  axios({
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: token
    },
    url: "https://lambda-treasure-hunt.herokuapp.com/api/bc/mine/",
    data: { proof: new_proof }
  })
    .then(results => {
      res.status(200).json({ message: "proof submited" });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "error" });
    });
};

module.exports = router => {
  router.get("/get-miner-id", getMinerID);
  router.get("/get-total-miners", getTotalMiners);
  router.get("/get-proof", getProof);
  router.post("/submit-proof", submitProof);
  return router;
};
