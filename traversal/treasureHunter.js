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
            // console.log(results.data);
            let x = results.data.room_id
            readMap(x)
            return results.data;
        })

        .catch(err => {
            console.log(err);
        });
        
};

const bfs = (starting_room, destination_room , data) => {

    visited_rooms = data

    console.log( data[ 0 ].exits )

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

            for ( neighbor in visited_rooms[ room ].exits ) {

                if (!( visited_rooms[ room ].exits[neighbor] in visited )) {

                    path_new = [...path];
                    
                    path_new.push(visited_rooms[ room ].exits[neighbor]);
                    console.log( visited_rooms[ room ].exits , neighbor  , room)
                    
                    queue.unshift(path_new);
                    
                    if ( visited_rooms[ room ].exits[neighbor] == destination_room) {
                        // path_new.pop();
                        last = path_new.length - 1;
                        console.log( path_new )
                        return visited_path[path_new[last]] = path_new;

                    }
                }
            }

            visited[room] = true;
        }
    }

    console.log(visited_path);
    return visited_path;

};

const readMap = (init_room) => {

    fs.readFile('data.json', (err, info) => {

        if (err) throw err;

        data = JSON.parse(info.toString())

        let treasure_room = []

        let entire_map = []

        for (var i = 0; i < Object.keys(data).length; i++) {

            if (data[Object.keys(data)[i]].items.includes('tiny treasure') || data[Object.keys(data)[i]].items.includes('small treasure')) {

                // console.log( `${ data[ Object.keys( data )[i] ].items.length } treasure found in room ${ Object.keys( data )[i] }` )
                // console.log( data[ Object.keys( data )[i] ].exits )
                treasure_room.push({ room: Object.keys(data)[i], exits: data[Object.keys(data)[i]].exits })

            }

            entire_map.push({ room: Object.keys(data)[i], exits: data[Object.keys(data)[i]].exits })

            // console.log( 'room' , Object.keys( data )[i] , data[ Object.keys( data )[i] ].items )

        }

        //get room number and exit
        // console.log( treasure_room )
        // console.log( entire_map )

        // CURRENT ROOM IS FROM INIT
        // console.log( init_room )

        //get closest destination
        // 53 is closest treasure room
        // console.log( treasure_room[0].room )

        let current_room = init_room
        var destination_room = treasure_room[0].room
        bfs( current_room , destination_room , data )

    })

}

getInit()