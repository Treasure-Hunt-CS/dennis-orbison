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
            console.log(results.data);
            let x = results.data.room_id
            readMap( x )
            return results.data;
        })
        .catch(err => {
            console.log(err);
        });
};

const readMap = ( init_room ) => {

    fs.readFile( 'data.json', (err, info ) => {

        if (err) throw err; 
        
        data = JSON.parse( info.toString())

        let treasure_room = []

        let entire_map = []

        for ( var i = 0; i < Object.keys( data ).length; i++ ) {

            if ( data[ Object.keys( data )[i] ].items.includes( 'tiny treasure' ) || data[ Object.keys( data )[i] ].items.includes( 'small treasure' ) ) {

                // console.log( `${ data[ Object.keys( data )[i] ].items.length } treasure found in room ${ Object.keys( data )[i] }` )
                // console.log( data[ Object.keys( data )[i] ].exits )
                treasure_room.push({ room: Object.keys( data )[i] , exits: data[ Object.keys( data )[i] ].exits })

            }

            entire_map.push({ room: Object.keys( data )[i] , exits: data[ Object.keys( data )[i] ].exits })

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

        var queue = []
        var history = []
        queue.push( init_room )

        let current_room = init_room
        var destination = treasure_room[0].room
        
        while ( queue ) {

            for ( var i = 0; i < entire_map.length; i++ ) {

                if ( queue[ queue.length - 1 ] == destination ) {
                    console.log( 'done' )
                    // break
                }
            
                // console.log( 'room num' , entire_map[i].room )
                // console.log( 'direction' , Object.keys( entire_map[i].exits) )
                // console.log( 'room exit #s' , Object.values( entire_map[i].exits) )
                // console.log( Object.values( entire_map[i].exits ) )

                let direction = Object.keys( entire_map[i].exits)
                let exit = Object.values( entire_map[i].exits )
                var room = entire_map[i].room
                history.push( room )
            
            
                if ( current_room == room ) {

                    console.log( 'you are here' , room , exit )
                    i = entire_map.length

                    for ( var y = 0; y < exit.length; y++ ) {
                    
                        if ( history.includes( exit[y] ) ) {
                            console.log( 'in history' )
                        } else {
                            if ( exit[y] <= current_room && exit[y] !== history[ history.length -1 ] )

                                history.push( exit[y] )
                                current_room = exit[y]

                            if ( exit[y] >= current_room && exit[y] !== history[ history.length -1 ] )

                                history.push( exit[y] )
                                current_room = exit[y]
                        }
        
                    }
                    
                }
                
            }
            
            console.log( 'queue' , queue )
            console.log( current_room )
            // console.log( 'queue' , queue.length )
        }

        // destination is closest room with treasure in it, traverse to it, then go back or go get more treasure
        
    })
}

getInit()