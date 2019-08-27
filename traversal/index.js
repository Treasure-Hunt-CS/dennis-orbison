const axios = require("axios");
const fs = require("fs");

const bfs = (starting_room, destination_room) => {
  if (starting_room === destination_room) {
    return [starting_room];
  }

  visited = {};
  visited_path = {};

  queue = [];

  queue.unshift([starting_room]);

  while (queue.length > 0) {
    path = queue.shift();
    last = path.length - 1;
    room = path[last];

    if (!(room in visited)) {
      for (neighbor in visited_rooms[room]["exits"]) {
        if (!(visited_rooms[room]["exits"][neighbor] in visited)) {
          path_new = [...path];

          path_new.push(visited_rooms[room]["exits"][neighbor]);

          queue.unshift(path_new);
          //   console.log(
          //     visited_rooms[room]["exits"][neighbor] === destination_room,
          //     // visited_rooms[room],
          //     room,
          //     neighbor,
          //     visited_rooms[room]["exits"][neighbor],
          //     path_new,
          //     queue
          //   );
          if (visited_rooms[room]["exits"][neighbor] === destination_room) {
            // console.log(
            //   visited_rooms[room][neighbor] === destination_room,
            //   visited_rooms[room][neighbor]
            // );
            path_new.pop();
            last = path_new.length - 1;
            visited_path[path_new[last]] = path_new;
          }
        }
      }

      visited[room] = true;
    }
  }

  //   console.log(visited_path);
  return visited_path;
};

// const specialMove = await() => {
//     mov
// }

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const convertPath = async (id, path, current_room, time, cb) => {
  let min = Infinity;
  let newPath;
  for (p in path) {
    if (min > path[p].length) {
      min = path[p].length;
      newPath = path[p];
      console.log(newPath);
    }
  }
  //   console.log();
  for (i = 0; i < newPath.length; i++) {
    if (i !== 0) {
      console.log(newPath[i], i);
      for (direction in visited_rooms[current_room]["exits"]) {
        console.log(
          "here",
          direction,
          visited_rooms[current_room]["exits"][direction],
          visited_rooms[current_room]["exits"][direction] === newPath[i]
        );
        if (visited_rooms[current_room]["exits"][direction] === newPath[i]) {
          console.log("waiting", time);
          await timeout(time);
          room_data = await move(id, direction, newPath[id]);
          current_room = room_data["room_id"];
          time = room_data["cooldown"] * 1000;
          //   break;
          // const items = room_data["items"];
          // const exits = room_data["exits"];

          // current_room = newPath[i];
        }
      }
      for (e in visited_rooms[current_room]["exits"]) {
        if (visited_rooms[current_room]["exits"][e] === false) {
          console.log("moving in this direction", e);
          //   moved = true;
          setTimeout(() => cb(id, e, current_room), time);
          break;
        }
      }
    }
  }
};

const getInit = id => {
  token = id;

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

const move = (id, direction, guess = false) => {
  console.log(guess);
  const token = id;
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

const travel = async (id, direction, prevRoom_id, guess = false) => {
  // if all rooms have been visited, traversal has been completed, will log time and then exit
  if (Object.keys(visited_rooms).length === 500) {
    console.timeEnd("completed time");
    console.log("all rooms visited");
    return;
  }

  try {
    let room_data;

    // condition type of movement or guess

    if (!direction) {
      // beginning, get location and exits
      let rawdata = fs.readFileSync("data.json");
      visited_rooms = JSON.parse(rawdata);
      console.time("completed time");
      room_data = await getInit(id);
    } else if (typeof guess === "number") {
      // move with guess

      room_data = await move(id, direction, guess);
      visited_rooms[prevRoom_id]["exits"][direction] = room_data["room_id"];
      //   console.log(visited_rooms);
      console.log("call move, with direction", direction);
      console.log("to room id", guess);
    } else {
      // move without guess, a new has been visited

      let data = JSON.stringify(visited_rooms);
      fs.writeFileSync("data.json", data);
      room_data = await move(id, direction);
      visited_rooms[prevRoom_id]["exits"][direction] = room_data["room_id"];
      console.log("call move, with direction", direction);
      //   console.log(visited_rooms);
    }

    // logging the current room
    console.log("\n", room_data["room_id"], "\n");

    // setting up data to be recorded in visited if not invisited
    const current_room = room_data["room_id"];
    const time = room_data["cooldown"] * 1000;
    const items = room_data["items"];
    const exits = room_data["exits"];

    if (!(current_room in visited_rooms)) {
      // if current room has not been visited it is added with associated data
      const roomExits = {};
      const title = room_data["title"];
      const description = room_data["description"];
      const elevation = room_data["elevation"];
      const terrain = room_data["terrain"];
      const errors = room_data["errors"];
      const messages = room_data["messages"];

      // setting exits to false
      for (e in exits) {
        roomExits[exits[e]] = false;
      }

      // updateing visited rooms
      visited_rooms[current_room] = {
        exits: roomExits,
        items,
        title,
        description,
        elevation,
        terrain,
        errors,
        messages
      };

      // setting exit just entered from to previous room id just came froom
      if (typeof prevRoom_id === "number") {
        visited_rooms[current_room]["exits"][reverse(direction)] = prevRoom_id;
      }
    }

    // variables to determine how to move
    let moved = false;
    let min = Infinity;

    // if room has one exit, it is a dead end and will go back to previous room
    if (exits.length === 1 && visited_rooms[current_room]["exits"][exits[0]]) {
      setTimeout(
        () =>
          travel(
            id,
            exits[0],
            current_room,
            visited_rooms[current_room]["exits"][exits[0]]
          ),
        time
      );
      moved = true;
    }

    // if room has an exit to a room that has not been visited  it will move to that room
    if (!moved) {
      for (e in visited_rooms[current_room]["exits"]) {
        if (visited_rooms[current_room]["exits"][e] === false) {
          console.log("moving in this direction", e);
          moved = true;
          setTimeout(() => travel(id, e, current_room), time);
          break;
        }
      }

      // if all exits have been visited it will go to the room with the smallest id
      if (!moved) {
        for (e in visited_rooms[current_room]["exits"]) {
          if (min > visited_rooms[current_room]["exits"][e]) {
            min = visited_rooms[current_room]["exits"][e];
          }
        }
      }
    }

    // this is a safty function just in case player starts south of room 0 and has not visited north room 0
    if (current_room === 0 && min === 1) {
      const rooms = bfs(0, false);
      //   console.log("rooms that have rooms not visited", rooms);
      convertPath(id, rooms, current_room, time, travel);
      moved = true;
    }

    // if min is not infinity and is an id it will move to that room with guess of that id
    if (!moved) {
      console.log("will move to room with smallest id", min);
      for (e in visited_rooms[current_room]["exits"]) {
        if (visited_rooms[current_room]["exits"][e] == min) {
          console.log("direction", e);
          setTimeout(() => travel(id, e, current_room, min), time);
          break;
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

let visited_rooms = {};

let id = "Token 2e289710723b27949296f5ad3152027ecb6061f1";
setTimeout(() => travel(id), 2653);
// let id = "Token ";
// setTimeout(() => travel(id), 2653);
// let id = "Token ";
// setTimeout(() => travel(id), 2653);

// let id = "Token 2e289710723b27949296f5ad3152027ecb6061f1";
// travel(id);

// 0 : {n: 10, s: 2, e: 1, w: 4}
// 2 :

// 30 : [{0: n}, {10: e}, {20: e}, {30: n}, false]
// 2 : [{0: s}, 2]
//

// startingLocation = visited[current_room];
// exits = startingLocation["exits"];
// for (e in exits) {
// }
