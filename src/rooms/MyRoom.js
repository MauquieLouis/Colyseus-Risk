const colyseus = require('colyseus');
const MyRoomState = require('./schema/MyRoomState').MyRoomState;
const Player = require('./schema/Player').Player

exports.MyRoom = class extends colyseus.Room {

	//maxClients = 8;
  	onCreate (options) {
		// - - - - - - - - - - - - - - - - - - - - - - - - -//
		// - - - - - - - - - My Room State - - - - - - - - -//
		// - - - - - - - - - - - - - - - - - - - - - - - - -//
    	//this.setState(new MyRoomState());
		this.setState(new Player());
		//Message Console quand quelqu'un rejoins le serveur
		console.log("SomeOne VerY SpeCiaL join the room")
		//Essai de changement de couleur d'écriture pour chaque personne
		options.username = changeColorFunction()
		console.log(options.username)
		const map = new MapSchema<Player>();
    	this.onMessage("message", (client, message) => {
      		console.log("ChatRoom received message from", client.sessionId, ":", message);
            this.broadcast("messages", `(${client.sessionId}) ${message}`);
			
		});
//		this.onMessage("author", (client, message) => {
//			console.log("New author name defined :", message)
//			player.pseudo = message;
//			console.log(options.pseudo, 'est le nouveau pseudo de ', client.sessionId)
//		});
		
		this.onMessage("userConnection")
	}

	onJoin (client, options) {
		player = this.setState(new Player());
//		player.pseudo = options.pseudo
		this.broadcast("messages", `${ client.sessionId } joined.`);
		this.broadcast("newUserJoin",`${client.sessionId}`)
		
		this.onMessage("author", (client, message) => {
			console.log("New author name defined :", message)
			player.pseudo = message;
			console.log(options.pseudo, 'est le nouveau pseudo de ', client.sessionId)
			console.logo(player.pseudo)
		});
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
