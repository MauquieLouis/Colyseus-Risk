const colyseus = require('colyseus');

//Include room state
const MyRoomState = require('./schema/MyRoomState').MyRoomState;
//Include Player class
const Player = require('./schema/Player').Player
//Include Matrix class
const Matrix = require('./schema/Matrix').Matrix;

exports.MyRoom = class MyRoom extends colyseus.Room {

	//maxClients = 8;
  	onCreate (options) {
		// - - - - - - - - - - - - - - - - - - - - - - - - -//
		// - - - - - - - - -All Room State - - - - - - - - -//

		this.setState(new MyRoomState());

		// - - - - - - - - - - - - - - - - - - - - - - - - -//
		
		
		// - - - - - - - - - - - - - - - - - - - - - - - - -//
		// - - - - - - - - -Matrix Init- - - - - - - - - - -//
		
//		const matrix = this.state.matrix
//		this.broadcast("matrixInit", ('line:'+matrix.line+',column'+matrix.column))
		
		// - - - - - - - - - - - - - - - - - - - - - - - - -//

		//Message Console quand quelqu'un rejoins le serveur
		console.log("SomeOne VerY SpeCiaL join the room")
		this.onMessage("author", (client, message) => {
			console.log("New author name defined :", message)
			const player = this.state.players.get(client.sessionId);
			player.nom = message;
			player.color = changeColorFunction()
			console.log(player.nom, 'est le nouveau pseudo de ', client.sessionId)
		});
		 		
    	this.onMessage("message", (client, message) => {
			const player = this.state.players.get(client.sessionId);
//			console.log(player.nom)
//			console.log(player.color)
      		console.log("ChatRoom received message from", client.sessionId, ":", message);
            this.broadcast("messages", `(${player.nom}) ${message}`);
		});
		
		//change matrice on click
		this.onMessage("caseClicked",(client, message)=>{
			const player = this.state.players.get(client.sessionId);
			const matrix = this.state.matrix
			matrix.matrix[message[0]][message[1]] = player.color
//			console.log(matrix.matrix)
			this.broadcast("matrixChange", matrix.matrix)
			console.log(message)
			console.log(this.state.players.get(client.sessionId).connected)
		})
	}

	onJoin (client, options) {
		this.state.players.set(client.sessionId, new Player());
		const matrix = this.state.matrix
		console.log(this.state.players.get(client.sessionId).connected)
		this.broadcast("matrixInit", [matrix.matrix,this.state.players.get(client.sessionId).connected])
		this.broadcast("matrixChange", matrix.matrix)
		this.broadcast("messages", `${ client.sessionId } joined.`);
		this.state.players.set(client.sessionId, new Player());
		this.state.players.get(client.sessionId).color = changeColorFunction()
		this.state.players.get(client.sessionId).connected = 1;
//		console.log(this.state.players)
	}

	onLeave (client, consented) {
		this.broadcast("messages", `${ client.sessionId } left.`);
		console.log("Hey a bitch leave the room");
	}

	onDispose() {
		console.log("Dispose ChatRoom");
	}

}

function changeColorFunction(){
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	console.log(color)
	return color;
}
