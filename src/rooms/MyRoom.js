const colyseus = require('colyseus');

//Include room state
const MyRoomState = require('./schema/MyRoomState').MyRoomState;
//Include Player class
const Player = require('./schema/Player').Player
//Include Matrix class
//const Matrix = require('./schema/Matrix').Matrix;

exports.MyRoom = class MyRoom extends colyseus.Room {

	//maxClients = 8;
  	onCreate (options) {
		// - - - - - - - - - - - - - - - - - - - - - - - - -//
		// - - - - - - - - - - -Room State - - - - - - - - -//

		this.setState(new MyRoomState());

		// - - - - - - - - - - - - - - - - - - - - - - - - -//
		
		// - - - - - - - - - - - - - - - - - - - - - - - - -//
		//Message Console quand quelqu'un rejoins le serveur
		console.log("SomeOne VerY SpeCiaL join the room")
		this.onMessage("author", (client, message) => {
			console.log("New author name defined :", message)
			const player = this.state.players.get(client.sessionId);
			player.nom = message;
			player.color = changeColorFunction()
			console.log(player.nom, 'est le nouveau pseudo de ', client.sessionId)
			this.broadcast("listUserConnected", this.state.players)
		});
		 	
		//testnico
		this.onMessage("destroy",(client, message)=>{
			console.log(message)
			const matrix = this.state.matrix;
			matrix.matrix[message[0]][message[1]] = "#000000";
			this.broadcast("matrixChange", matrix.matrix);
		})
		
		
		
		
		
		
		
			
    	this.onMessage("message", (client, message) => {
			const player = this.state.players.get(client.sessionId);
      		console.log("ChatRoom received message from", client.sessionId, ":", message);
			// 3 paramètre pour message : 1er : le message; 2eme : le pseudo, 3eme : la couleur
			this.broadcast("messages", [message, player.nom, player.color])
		});
		
		//change matrice on click
		this.onMessage("caseClicked",(client, message)=>{
			const player = this.state.players.get(client.sessionId);
			const matrix = this.state.matrix
			matrix.matrix[message[0]][message[1]] = player.color
			console.log(matrix.matrix)
			this.broadcast("matrixChange", matrix.matrix)
			console.log(message)
			console.log(this.state.players.get(client.sessionId).connected)
		})
		
		
		
		this.onMessage("randomyellowcolor",(client, message)=>{
			const matrix = this.state.matrix
			matrix.matrix[message[0]][message[1]] = "yellow"
			this.broadcast("matrixChange", matrix.matrix)
			})
	}

	onJoin (client, options) {
		this.state.players.set(client.sessionId, new Player());
		const matrix = this.state.matrix
		// Affichage de la matrice
		this.broadcast("matrixInit",matrix.matrix)
		this.broadcast("matrixChange", matrix.matrix)
		console.log(this.state.players)
		this.state.players.get(client.sessionId).color = changeColorFunction()
		// Affichage liste users présent
		this.broadcast("listUserConnected", this.state.players);
		const player = this.state.players.get(client.sessionId);
		// 3 paramètre pour message : 1er : le message; 2eme : le pseudo, 3eme : la couleur
		this.broadcast("messages", [('('+client.sessionId+') : joined the fucking session !'),player.nom,player.color]);
	}

	onLeave (client, consented) {
		this.state.players.delete(client.sessionId)
		// 3 paramètre pour message : 1er : le message; 2eme : le pseudo, 3eme : la couleur
		this.broadcast("messages", [('('+client.sessionId+') : left the fucking session !'),player.nom,player.color]);
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
