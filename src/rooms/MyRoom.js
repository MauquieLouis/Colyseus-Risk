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
			var territoire = new Territoire("0","0","0","0");
			territoire = this.state.carte.get(message)
			console.log(this.state.carte.get(message))
			console.log(territoire.nom)
			if(territoire.proprietaire == client.sessionId && IdActif == client.sessionId && player.stock!=0){
				territoire.army++
				player.stock--
				PasserLaMain()
				this.broadcast("activePlayer",[this.state.players.get(IdActif).nom,this.state.players.get(IdActif).color])
			}
			if(territoire.proprietaire == client.sessionId && IdActif == client.sessionId && player.stock==0){
				console.log("ça marcche")
			}
			this.state.carte.set(message,territoire)
			this.state.carte.forEach((value, index) => {
				console.log(index+" : "+value.nom+", "+value.continent+", "+value.proprietaire+", "+value.army)
			})
			this.broadcast("carteChange", [this.state.players,this.state.carte])
		})
		
		//Implementer la fonction qui rempli la map carte en fonction du tableau javascript renvoyé !=
		this.onMessage("carte",(client, message)=>{
			console.log("This :"+message);
			console.log(message.length);
			for(var i = 0; i<42; i++){
				this.state.carte.set(message[i]['name'],new Territoire(message[i]['name'],message[i]['continent'],message[i]['proprietaire'],getVoisins(message[i]['name'])))
			}
			var peru = this.state.carte.get('peru')
			console.log(this.state.carte.get('peru').nom)
		})
		
		//LANCEMENT DE LA PARTIE !!! :D (la joie et le bonne humeur se répandent grâce à nous <3)
		var nbplayersstarted = 0
		this.onMessage("GetStarted",(client)=>{
			this.broadcast("GameHasStarted")
			Order.forEach((Id) => {
//				console.log("GetStarted "+client.sessionId)
				const player = this.state.players.get(Id)
				player.stock = originalStock(this.state.players.size)
				var nbplayers = this.state.players.size - nbplayersstarted
				var nbterritoireslibres = 0
				this.state.carte.forEach((value) =>{
					if(value.proprietaire == "none"){
						nbterritoireslibres++
					}
				})
//				console.log(nbterritoireslibres)
				var compteur = Math.floor(nbterritoireslibres/nbplayers)
				var i = 0
				while(i<compteur){
					var k = -1
					var a = Math.floor(Math.random() * 42)
					this.state.carte.forEach((value) =>{
					k++
					if(k == a && value.proprietaire == "none"){
						value.proprietaire=Id
						player.stock--
						i++
					}
				})			
				}
				nbplayersstarted++
				})
			this.broadcast("carteChange", [this.state.players,this.state.carte])
			if(nbplayersstarted==this.state.players.size){
				OrderInitialize()
				this.broadcast("activePlayer",[this.state.players.get(IdActif).nom,this.state.players.get(IdActif).color])
			}
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
//		this.broadcast("carteChange", [this.state.players,this.state.carte])
		this.broadcast("matrixInit",matrix.matrix)
		this.broadcast("matrixChange", matrix.matrix)
		//console.log(this.state.players)
		this.state.players.get(client.sessionId).color = changeColorFunction()
		// Affichage liste users présent
		this.broadcast("listUserConnected", this.state.players);
		const player = this.state.players.get(client.sessionId);
		// 3 paramètre pour message : 1er : le message; 2eme : le pseudo, 3eme : la couleur
		console.log(client.sessionId+" joined")
		Order.push(client.sessionId)
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
//Gestion de l'ordre des joueurs
var Order = []
var IdActif = "none"
function OrderInitialize(){
	Order.sort()
	IdActif = Order[0]
}
function PasserLaMain(){
	var IndexActif = Order.indexOf(IdActif)
	if(IndexActif==Order.length-1){
		IdActif=Order[0]
	}
	else{
		IdActif=Order[IndexActif+1]
	}
	
}

//Gestion du stock de départ
function originalStock(nbPlayers){
	return 50-5*nbPlayers
}


//Generation couleur aléatoire
function changeColorFunction(){
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	console.log(color)
	return color;
}

//Fonction initialisation des voisins
function getVoisins(name){
	if(name=="eastern_australia"){return ["western_australia","new_guinea"]}
	if(name=="western_australia"){return ["eastern_australia","new_guinea","indonesia"]}
	if(name=="new_guinea"){return ["western_australia","eastern_australia","siam","indonesia"]}
	if(name=="indonesia"){return ["western_australia","new_guinea","siam"]}
	if(name=="siam"){return ["indonesia","india","china"]}
	if(name=="india"){return ["siam","china","afghanistan","middle_east"]}
	if(name=="middle_east"){return ["russia","east_africa","egypt","afghanistan","india"]}
	if(name=="afghanistan"){return ["middle_east","india","china","russia","ural"]}
	if(name=="china"){return ["afghanistan","siam","india","ural","siberia","mongolia"]}
	if(name=="mongolia"){return ["china","siberia","japan","kamchatka","irkutsk"]}
	if(name=="japan"){return ["kamchatka","mongolia"]}
	if(name=="siberia"){return ["ural","china","mongolia","yakursk","irkursk"]}
	if(name=="ural"){return ["russia","afghanistan","china","siberia"]}
	if(name=="irkutsk"){return ["mongolia","siberia","kamchatka","yakutsk"]}
	if(name=="yakutsk"){return ["irkutsk","kamchatka","siberia"]}
	if(name=="kamchatka"){return ["irkutsk","yakutsk","japan","mongolia","alaska"]}
	if(name=="russia"){return ["ural","afghanistan","middle_east","southern_europe","northern_europe","scandinavia"]}
	if(name=="scandinavia"){return ["russia","iceland","great_britain","northern_europe"]}
	if(name=="northern_europe"){return ["southern_europe","russia","scandinavia","western_europe","great_britain"]}
	if(name=="southern_europe"){return ["egypt","north_africa","middle_east","western_europe"]}
	if(name=="western_europe"){return ["north_africa","great_britain","southern_europe","northern_europe"]}
	if(name=="great_britain"){return ["western_europe","iceland","scandinavia","northern_europe"]}
	if(name=="iceland"){return ["great_britain","northern_europe","scandinavia","greenland"]}
	if(name=="greenland"){return ["iceland","northwest_territory","ontario","quebec"]}
	if(name=="northwest_territory"){return ["alaska","ontario","greenland","alberta"]}
	if(name=="alaska"){return ["northwest_territory","alberta","kamchatka"]}
	if(name=="alberta"){return ["alaska","northwest_territory","ontario","western_united_states"]}
	if(name=="ontario"){return ["western_united_states","alberta","quebec","eastern_united_states","northwest_territory","greenland"]}
	if(name=="quebec"){return ["greenland","ontario","eastern_united_states"]}
	if(name=="eastern_united_states"){return ["western_united_states","ontario","quebec","central_america"]}
	if(name=="western_united_states"){return ["alberta","ontario","central_america","eastern_united_states"]}
	if(name=="central_america"){return ["western_united_states","eastern_united_states","venezuela"]}
	if(name=="venezuela"){return ["central_america","brazil","peru"]}
	if(name=="peru"){return ["brazil","venezuela","argentina"]}
	if(name=="brazil"){return ["peru","venezuela","argentina","north_africa"]}
	if(name=="argentina"){return ["peru","brazil"]}
	if(name=="north_africa"){return ["brazil","western_europe","southern_europe","egypt","east_africa","congo"]}
	if(name=="egypt"){return ["southern_europe","middle_east","north_africa","east_africa"]}
	if(name=="east_africa"){return ["egypt","middle_east","north_africa","congo","madagascar"]}
	if(name=="madagascar"){return ["south_africa","east_africa"]}
	if(name=="south_africa"){return ["madagascar","congo","east_africa"]}
	if(name=="congo"){return ["south_africa","north_africa","east_africa"]}
}
