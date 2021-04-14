const colyseus = require('colyseus');

//Include room state
const MyRoomState = require('./schema/MyRoomState').MyRoomState;
//Include Player class
const Player = require('./schema/Player').Player
const Territoire = require('./schema/Territoire').Territoire
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
			this.broadcast("matrixChange", matrix.matrix)
			console.log(message)
			console.log(this.state.players.get(client.sessionId).connected)
		})
		
		//testNicoclickterritoire
		
		this.onMessage("territoireClicked",(client, message)=>{
			const player = this.state.players.get(client.sessionId);
			console.log("Territoire clicked")
			console.log(client.sessionId)
			console.log(message);
			var territoire = new Territoire("0","0","0");
			territoire = this.state.carte.get(message)
			console.log(this.state.carte.get(message))
			console.log(territoire.nom)
			territoire.proprietaire = client.sessionId
			this.state.carte.set(message,territoire)
			this.state.carte.forEach((value, index) => {
				console.log(index+" : "+value.nom+", "+value.continent+", "+value.proprietaire)
			})
			this.broadcast("carteChange", [this.state.players,this.state.carte])
		})
		
		//Implementer la fonction qui rempli la map carte en fonction du tableau javascript renvoyé !=
		this.onMessage("carte",(client, message)=>{
			console.log("This :"+message);
			console.log(message.length);
			for(var i = 0; i<42; i++){
				this.state.carte.set(message[i]['name'],new Territoire(message[i]['name'],message[i]['continent'],message[i]['proprietaire']))
			}
			var peru = this.state.carte.get('peru')
			console.log(this.state.carte.get('peru').nom)
		})
		
		//GetStarted
		var nbplayersstarted = 0
		this.onMessage("GetStarted",(client)=>{
			console.log("GetStarted "+client.sessionId)
			var nbplayers = this.state.players.size - nbplayersstarted
			var nbterritoireslibres = 0
			this.state.carte.forEach((value) =>{
				if(value.proprietaire == "none"){
					nbterritoireslibres++
				}
			})
//			console.log(nbterritoireslibres)
			var compteur = Math.floor(nbterritoireslibres/nbplayers)
			var i = 0
			while(i<compteur){
				var k = -1
				var a = Math.floor(Math.random() * 42)
				this.state.carte.forEach((value) =>{
				k++
				if(k == a && value.proprietaire == "none"){
					value.proprietaire=client.sessionId
					i++
				}
			})			
			}
			nbplayersstarted++
			this.broadcast("carteChange", [this.state.players,this.state.carte])
		})
	}
	

	onJoin (client, options) {
		this.state.players.set(client.sessionId, new Player());
		const matrix = this.state.matrix
		if(this.state.carteInit==false)
		{
			this.broadcast("CarteInit",this.state.carte);
			this.state.carteInit = true;
		}
		// Affichage de la matrice
		this.broadcast("carteChange", [this.state.players,this.state.carte])
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
