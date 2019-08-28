const axios = require("axios");
const fs = require("fs");

const getInit = () => {
<<<<<<< HEAD
  token = "Token a01402b735cf167aada6e0971168135236e21079";
=======
  token = "Token 2e289710723b27949296f5ad3152027ecb6061f1";
>>>>>>> 530bebcb114434c1c431050f1140bcf769bcc61f

  return axios({
    method: "get",
    headers: {
      "content-type": "application/json",
      Authorization: token
    },

    url: "https://lambda-treasure-hunt.herokuapp.com/api/adv/init/"
  })
    .then(results => {
      let x = results.data.room_id;
      console.log(x);
      readMap(x, results.data.cooldown);
      return results.data;
    })

    .catch(err => {
      console.log(err);
    });
};

const getInv = () => {
<<<<<<< HEAD
  token = "Token a01402b735cf167aada6e0971168135236e21079";
=======
  token = "Token 2e289710723b27949296f5ad3152027ecb6061f1";
>>>>>>> 530bebcb114434c1c431050f1140bcf769bcc61f

  return axios({
    method: "post",
    headers: {
      "content-type": "application/json",
      Authorization: token
    },

    url: "https://lambda-treasure-hunt.herokuapp.com/api/adv/status/"
  })
    .then(results => {
      let x = results.data;
      console.log(x);
      if (x.inventory.length == 0) {
        // setTimeout( () => (getInit()) , 1000 )
      } else if (x.inventory.length <= 5) {
        // bfs( current_room , 1 ,  )
        console.log("get money");
      }
      return results.data;
    })

    .catch(err => {
      console.log(err);
    });
};

const bfs = (starting_room, destination_room, data, cooldown) => {
  visited_rooms = data;

  if (starting_room === destination_room) {
    return [starting_room];
  }

  visited = {};
  visited_path = {};
  queue = [];
  queue.unshift([[starting_room, "start"]]);

  while (queue.length > 0) {
    path = queue.shift();
    last = path.length - 1;
    room = path[last][0];
    // console.log( path )
    if (!(room in visited)) {
      for (neighbor in visited_rooms[room].exits) {
        if (!(visited_rooms[room].exits[neighbor] in visited)) {
          path_new = [...path];

          path_new.push([visited_rooms[room].exits[neighbor], neighbor]);

          queue.unshift(path_new);

          if (visited_rooms[room].exits[neighbor] == destination_room) {
            last = path_new.length - 1;
<<<<<<< HEAD
            // console.log( path_new )
=======
            console.log(path_new);
>>>>>>> 530bebcb114434c1c431050f1140bcf769bcc61f
            move(path_new, cooldown);
            return (visited_path[path_new[last][0]] = path_new);
          }
        }
      }

      visited[room] = true;
    }
  }

  // console.log(visited_path);
  // setTimeout( () => (getInv()) , 1000 )

  return visited_path;
};

const move = async (path, cooldown) => {
  for (i = 1; i < path.length; i++) {
    let step = path[i][1];
    let direction = { direction: step, next_room_id: path[i][0].toString() };
    // let direction = { direction: step }
    // console.log( path )
    // console.log( direction )
<<<<<<< HEAD
    console.log("cd", cooldown);
    await timeout(cooldown * 1000);
    console.log("ping");
=======
    // console.log("cd", cooldown);
    await timeout(cooldown * 1000);
    // console.log("ping");
>>>>>>> 530bebcb114434c1c431050f1140bcf769bcc61f
    await axios
      .post(
        "https://lambda-treasure-hunt.herokuapp.com/api/adv/move/",
        direction,
        {
          headers: {
<<<<<<< HEAD
            Authorization: `Token a01402b735cf167aada6e0971168135236e21079`
=======
            Authorization: `Token 2e289710723b27949296f5ad3152027ecb6061f1`
>>>>>>> 530bebcb114434c1c431050f1140bcf769bcc61f
          }
        }
      )
      .then(res => {
        console.log("room id:", res.data.room_id);
<<<<<<< HEAD
        console.log("after axios", res.data.cooldown);
        cooldown = res.data.cooldown;
      })
      .catch(err => console.log("ERROR IN MOVE", err.message));
=======
        // console.log("after axios", res.data.cooldown);
        console.log(res.data);
        cooldown = res.data.cooldown;
      })
      .catch(err => console.log("ERROR IN MOVE"));
>>>>>>> 530bebcb114434c1c431050f1140bcf769bcc61f
  }
  // await timeout( cooldown )
};

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const readMap = (init_room, cooldown) => {
  fs.readFile("data.json", (err, info) => {
    if (err) throw err;
<<<<<<< HEAD

    data = JSON.parse(info.toString());

    let treasure_room = [];

    let entire_map = [];

    for (var i = 0; i < Object.keys(data).length; i++) {
      if (
        data[Object.keys(data)[i]].items.includes("tiny treasure") ||
        data[Object.keys(data)[i]].items.includes("small treasure")
      ) {
        // console.log( `${ data[ Object.keys( data )[i] ].items.length } treasure found in room ${ Object.keys( data )[i] }` )
        // console.log( data[ Object.keys( data )[i] ].exits )
        treasure_room.push({
          room: Object.keys(data)[i],
          exits: data[Object.keys(data)[i]].exits
        });
      }

      entire_map.push({
        room: Object.keys(data)[i],
        exits: data[Object.keys(data)[i]].exits
      });

=======

    data = JSON.parse(info.toString());

    let treasure_room = [];

    let entire_map = [];

    for (var i = 0; i < Object.keys(data).length; i++) {
      if (
        data[Object.keys(data)[i]].items.includes("tiny treasure") ||
        data[Object.keys(data)[i]].items.includes("small treasure")
      ) {
        // console.log(
        //   `${data[Object.keys(data)[i]].items.length} treasure found in room ${
        //     Object.keys(data)[i]
        //   }`
        // );
        // console.log( data[ Object.keys( data )[i] ].exits )
        treasure_room.push({
          room: Object.keys(data)[i],
          exits: data[Object.keys(data)[i]].exits
        });
      }

      entire_map.push({
        room: Object.keys(data)[i],
        exits: data[Object.keys(data)[i]].exits
      });

>>>>>>> 530bebcb114434c1c431050f1140bcf769bcc61f
      // console.log( 'room' , Object.keys( data )[i] , data[ Object.keys( data )[i] ].items )
    }

    //get room number and exit
    // console.log( treasure_room )
    // console.log( entire_map )

    // CURRENT ROOM IS FROM INIT
    // console.log( init_room )

    //get closest destination
    // 53 is closest treasure room
<<<<<<< HEAD
    // console.log( treasure_room[0].room )
=======
    console.log(treasure_room[0].room);
>>>>>>> 530bebcb114434c1c431050f1140bcf769bcc61f

    let current_room = init_room;
    var destination_room = 250;
    bfs(current_room, destination_room, data, cooldown);
  });
};

getInit();
getInv();
