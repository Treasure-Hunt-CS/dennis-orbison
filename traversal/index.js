const axios = require("axios");
const fs = require("fs");

const getInit = () => {
  token = "Token dda434406f687265418a0e63333a042355b1fbfd";

  return axios({
    method: "get",
    headers: {
      "content-type": "application/json",
      Authorization: token
    },
    url: "https://lambda-treasure-hunt.herokuapp.com/api/adv/init/"
  })
    .then(results => {
      //   console.log(results.data);
      return results.data;
    })
    .catch(err => {
      console.log(err);
    });
};

const move = (direction, guess = false) => {
  const token = "Token dda434406f687265418a0e63333a042355b1fbfd";
  let data = { direction };
  if (guess) {
    data = { direction, next_room_id: guess };
  }
  return axios({
    method: "post",
    headers: {
      "content-type": "application/json",
      Authorization: token
    },
    url: "https://lambda-treasure-hunt.herokuapp.com/api/adv/move/",
    data: data
  })
    .then(results => {
      console.log(results.data);
      return results.data;
    })
    .catch(err => {
      console.log(err);
    });
};

const travel = async (direction, prevRoom_id, guess = false) => {
  // first get room id
  console.log("guess", guess);
  try {
    let room_data;

    if (!direction) {
      room_data = await getInit();
      // } else if (guess) {
      //   room_data = await move(direction, guess);
      //   visited_rooms[prevRoom_id]["exits"][direction] = room_data["room_id"];
      //   console.log("call move, with direction", direction);
      //   console.log(visited_rooms);
    } else {
      let data = JSON.stringify(visited_rooms);
      fs.writeFileSync("data.json", data);
      room_data = await move(direction);
      visited_rooms[prevRoom_id]["exits"][direction] = room_data["room_id"];
      console.log("call move, with direction", direction);
      //   console.log(visited_rooms);
    }

    let current_room = room_data["room_id"];
    console.log("\n", current_room, "\n");
    let exits = room_data["exits"];
    let items = room_data["items"];
    let title = room_data["title"];
    let description = room_data["description"];
    let time = room_data["cooldown"];
    time = time * 1000;

    if (!(current_room in visited_rooms)) {
      const roomExits = {};
      for (e in exits) {
        roomExits[exits[e]] = false;
      }
      // will more data after figuring this out
      visited_rooms[current_room] = {
        exits: roomExits,
        items,
        title
        // description
      };
    }

    let min = null;
    let moved = false;
    for (e in visited_rooms[current_room]["exits"]) {
      if (visited_rooms[current_room]["exits"][e] == false) {
        console.log("moving to here", e);
        moved = true;
        setTimeout(() => travel(e, current_room), time);
        break;
      } else {
        if (min == null || visited_rooms[current_room]["exits"][e] < min) {
          //   console.log(visited_rooms[current_room]["exits"][e], e);
          min = visited_rooms[current_room]["exits"][e];
          //   console.log(
          //     min,
          //     current_room,
          //     visited_rooms[current_room][e],
          //     visited_rooms[current_room],
          //     e
          //   );
        }
      }
    }

    if (min != null && !moved) {
      console.log("will move to room with smallest id", min);
      for (e in visited_rooms[current_room]["exits"]) {
        if (visited_rooms[current_room]["exits"][e] == min) {
          setTimeout(() => travel(e, current_room, min), time);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }

  // check for exits

  // if not in visited record room in visited with exits and other data
  // loop through exits
  // check if room has been visited
  // go to room that has not been visited
};

// getInit();

// move("");

const visited_rooms = {};
let room_data = null;
// let current_room = null

travel();
