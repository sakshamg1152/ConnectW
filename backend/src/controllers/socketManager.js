import { Server } from "socket.io";

let connections={};
let messages={};
let timeOnline={};


export const connectToSocket = (server) =>{
    const io = new Server(server , {
        cors : {
            origin : "*",
            methods : ["GET" , "POST"],
            allowedHeaders : ["*"],
            credentials : true
        }
    });

    io.on("connection", (socket)=>{

        socket.on("join-call" , (path) => {
            if(connections[path]===undefined){
                connections[path]=[];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            // INFROMING ALL USERS THAT NEW USER HAS JOINED.
            for(let a=0 ; a<connections[path].length ; a++){
                io.to(connections[path][a]).emit("user-joined" , socket.id , connections[path]);
            }

            // Sending old chats messages to the new user joined.
            if(messages[path]!==undefined){
                for(let a=0 ; a<messages[path].length ; a++){
                    io.to(socket.id).emit("chat-message" , messages[path][a]['data'],
                    messages[path][a]['sender'] , messages[path][a]['socket-id-sender'])
                }
            }

        })

        socket.on("signal" , (toId , message) =>{
            io.to(toId).emit("signal" , socket.id , message);

        })

        socket.on("chat-message", (data, sender) => {
            let matchingRoom = null;
            // Find room of current user
            for (let room in connections) {
                if (connections[room].includes(socket.id)) {
                    matchingRoom = room;
                    break;
                }
            }
            if (matchingRoom !== null) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({
                    sender: sender,
                    data: data,
                    "socket-id-sender": socket.id
                });
                console.log("message",matchingRoom,":",sender,data);
                connections[matchingRoom].forEach((id) => {
                    io.to(id).emit("chat-message",data,sender,socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            let diffTime =Math.abs(new Date() - timeOnline[socket.id]);
            let roomFound = null;
            // Find user's room
            for (let room in connections) {
                if (connections[room].includes(socket.id)) {
                    roomFound = room;
                    break;
                }
            }
            if (roomFound !== null) {

                // Notify everyone
                connections[roomFound].forEach((id) => {
                    io.to(id).emit("user-left",socket.id);
                });

                // Remove user
                let index =connections[roomFound].indexOf(socket.id);
                connections[roomFound].splice(index, 1);
                
                // Delete empty room
                if (connections[roomFound].length === 0) {
                    delete connections[roomFound];
                }

            }

        });

    })



    return io;

}

