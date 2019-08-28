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
  return axios({
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: "Token a01402b735cf167aada6e0971168135236e21079"
    },
    url: "https://lambda-treasure-hunt.herokuapp.com/api/bc/last_proof/"
  })
    .then(res => {
      console.log(res.data);
      last_proof = res.data;

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
  if (proof % 1000000 == 0 && proof != 0) console.log(proof);
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
    .post(
      "https://lambda-treasure-hunt.herokuapp.com/api/bc/mine/",
      { proof: found_proof },
      {
        headers: {
          "content-type": "application/json",
          Authorization: "Token a01402b735cf167aada6e0971168135236e21079"
        }
      }
    )
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
    // console.log("Start cooldown ", last_proof.cooldown * 1000);
    // await timeout(last_proof.cooldown * 1000);

    // Create a new proof from the found proof
    let found_proof = await proof_of_work(last_proof);
    console.log(found_proof);
    // console.log("Finished mining the proof");
    // console.log("FOUND PROOF IS", found_proof);
    // //TODO add headers with new proof
    let mine_response = await mine_proof(found_proof);
    console.log("MINE RES IS ", mine_response);
    // //TODO check if we need it
    await timeout(15000);
    // TODO Finish the if statement based on mine resonse
    // if (mine_response.json()['messages'] == '?'){
    //     coins_mined += 1;
    //     console.log(coins_mined)
    // }
  }
}
miner();

// 2e289710723b27949296f5ad3152027ecb6061f1
// a01402b735cf167aada6e0971168135236e21079
