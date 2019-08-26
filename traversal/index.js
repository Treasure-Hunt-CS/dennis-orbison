const axios = require("axios");
const fs = require("fs");

const getInit = () => {
  token = "Token 2e289710723b27949296f5ad3152027ecb6061f1";

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
  const token = "Token 2e289710723b27949296f5ad3152027ecb6061f1";
  let data = { direction };
  if (guess) {
    data = { direction, next_room_id: String(guess) };
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

const reverse = direction => {
  if (direction === "n") {
    return "s";
  } else if (direction === "s") {
    return "n";
  } else if (direction === "w") {
    return "e";
  } else if (direction === "e") {
    return "w";
  }
};

const travel = async (direction, prevRoom_id, guess = false) => {
  // first get room id
  console.log("guess", guess);
  try {
    let room_data;

    if (!direction) {
      room_data = await getInit();
    } else if (guess) {
      room_data = await move(direction, guess);
      visited_rooms[prevRoom_id]["exits"][direction] = room_data["room_id"];
      console.log("call move, with direction", direction);
      console.log(visited_rooms);
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
        title,
        description
      };

      visited_rooms[current_room]["exits"][reverse(direction)] = prevRoom_id;
    }

    let moved = false;
    if (exits.length === 1 && visited_rooms[current_room]["exits"][exits[0]]) {
      console.log("room has one exit should go back");
      console.log(
        time,
        exits[0],
        visited_rooms[current_room]["exits"][exits[0]]
      );
      //   return;
      setTimeout(
        () =>
          travel(
            exits[0],
            current_room,
            visited_rooms[current_room]["exits"][exits[0]]
          ),
        time
      );
      moved = true;
    }

    let min = null;
    if (!moved) {
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
    }

    if (min != null && !moved) {
      console.log("will move to room with smallest id", min);
      for (e in visited_rooms[current_room]["exits"]) {
        if (visited_rooms[current_room]["exits"][e] == min) {
          console.log("direction", e);
          setTimeout(
            () =>
              travel(
                e,
                current_room,
                visited_rooms[current_room]["exits"][exits[e]]
              ),
            time
          );
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
