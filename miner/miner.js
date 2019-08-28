const axios = require("axios");
const utf8 = require("utf8");
const crypto = require("crypto");

let base_url = "https://lambda-treasure-hunt.herokuapp.com/api/bc/";

let headers = {
  "Content-Type": "application/json",
  Authorization: "Token a01402b735cf167aada6e0971168135236e21079"
};

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function get_last_proof() {
  return axios
    .get(`${base_url}/last_proof/`, (headers = headers))
    .then(res => {
      last_proof = res;

      return last_proof;
    })
    .catch(err => {
      console.log(err.message);
    });
}

function proof_of_work(last_proof) {
  proof = 0;
  while (valid_proof(last_proof, proof) === false) {
    proof += 1;
  }
  return proof;
}

function valid_proof(last_proof, proof) {
  let str = `${last_proof.proof}${proof}`;
  let guess = utf8.encode(str);

  let guess_hash = crypto
    .createHash("sha256")
    .update(guess)
    .digest("hex");

  return (
    guess_hash.slice(0, last_proof.difficulty) ===
    "0".repeat(last_proof.difficulty)
  );
}

function mine_proof(found_proof) {
  return axios
    .post(`${base_url}/mine/`, { proof: [found_proof] })
    .then(res => {
      res_message = res;

      return res_message;
    })
    .catch(err => {
      console.log(err.message);
    });
}

let coins_mined = 0;
async function miner() {
  while (true) {
    let last_proof = await get_last_proof();
    console.log("Start mining the proof ");
    // let found_proof = res.json()['proof']
    // TODO
    console.log("Start cooldown ", last_proof.cooldown * 1000);
    await timeout(last_proof.cooldown * 1000);

    // Create a new proof from the found proof
    let found_proof = await proof_of_work(last_proof);
    console.log("Finished mining the proof");
    console.log("FOUND PROOF IS", found_proof);
    //TODO add headers with new proof
    let mine_response = await mine_proof(found_proof);
    console.log("MINE RES IS ", mine_response);
    //TODO check if we need it
    await timeout(mine_response.cooldown * 1000);
    // TODO Finish the if statement based on mine resonse
    // if (mine_response.json()['messages'] == '?'){
    //     coins_mined += 1;
    //     console.log(coins_mined)
    // }
  }
}
miner();
