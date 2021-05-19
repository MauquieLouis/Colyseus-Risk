const colyseus = require('colyseus');

//Include room state
const MyRoomState = require('./schema/MyRoomState').MyRoomState;
//Include Player class
const Player = require('./schema/Player').Player
const Territoire = require('./schema/Territoire').Territoire
//const Matrix = require('./schema/Matrix').Matrix;
var GameStarted = false
var state = "placementInitial"

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
		console.log(this)
		this.onMessage("author", (client, message) => {
			console.log("New author name defined :", message)
			const player = this.state.players.get(client.sessionId);
			player.nom = message;
//			player.color = changeColorFunction()
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
		
		var deplacementencours = false
		var deplacementdepuis = 0

		var attaqueencours = false
		var territoireattaque = 0

		this.onMessage("territoireClicked",(client, message)=>{
			const player = this.state.players.get(client.sessionId);
			console.log("Territoire clicked",state, IdActif)
//			console.log(client.sessionId)
//			console.log(message);
			var territoire = new Territoire("0","0","0","0");
			territoire = this.state.carte.get(message)
//			console.log(this.state.carte.get(message))
//			console.log(territoire.nom)

			if (IdActif != client.sessionId) {return}
			if (state=="placementInitial" ){
				console.log(player.stock)
				
				if(territoire.proprietaire == client.sessionId && player.stock!=0 && state=="placementInitial"){
					territoire.army++
					player.stock--
					PasserLaMain()
				}
				if (this.state.players.get(IdActif).stock==0){
					state="renforts"
					this.state.players.get(IdActif).stock=calculRenforts(IdActif,this.state.carte)
				}
				this.broadcast("activePlayer",[state, this.state.players.get(IdActif).nom, this.state.players.get(IdActif).color])
				this.broadcast("carteChange", [this.state.players,this.state.carte])								
			}
			else if(state=="renforts"){
				if(territoire.proprietaire == client.sessionId && player.stock!=0){
					territoire.army++
					player.stock--
					this.broadcast("carteChange", [this.state.players,this.state.carte])
				}
				if(player.stock==0){
					console.log("le state a été mis en attaque")
					state="inconnu"
					client.send("Attaque_Confirmer",[""])
				}
			}
			else if(state=="attaque"){	
				if(territoire.proprietaire == client.sessionId && !attaqueencours && Deplacement_ennemiLimitrophe(territoire)){
					territoireattaque = territoire
					attaqueencours=true
					this.broadcast("Attaque_Rafraichir",[territoireattaque.nom, territoire.army.toString(), "", ""])
					console.log("l'attaque est en cours")
					console.log(territoireattaque.nom)
				}
				else if(territoire.proprietaire != client.sessionId && attaqueencours){
					console.log("on teste si c'est possible attaque")
					var territoiredefense = territoire
					var combattre = Combat_attaquePossible(territoireattaque,territoiredefense) // boolean
					console.log("attaque"+territoireattaque.nom+" vs defense:"+territoiredefense.nom)
					console.log("Ce combat est " + combattre)
					if(!combattre){
						console.log("attente nouveau territoire")
						attaqueencours=false
					}
					else{
						this.broadcast("Attaque_Rafraichir",[territoireattaque.nom, territoireattaque.army.toString(), territoiredefense.nom, territoiredefense.army.toString()])
						client.send("Attaque_Combat",[territoireattaque.nom, territoireattaque.army.toString(), territoiredefense.nom, territoiredefense.army.toString()])
						state="inconnu"
//						state="deplacement"
//						console.log("le state a été mis en deplacement")
//						attaqueencours=false
//						this.broadcast("activePlayer",[state, this.state.players.get(IdActif).nom, this.state.players.get(IdActif).color])
					}
				}
			}
			else if(state=="reattaque"){
				if(territoire.proprietaire != client.sessionId && attaqueencours){
					console.log("on teste si c'est possible attaque")
					var territoiredefense = territoire
					var combattre = Combat_attaquePossible(territoireattaque,territoiredefense) // boolean
					console.log("attaque"+territoireattaque.nom+" vs defense:"+territoiredefense.nom)
					console.log("Ce combat est " + combattre)
					if(!combattre){
						console.log("attente nouveau territoire")
						attaqueencours=true
					}
					else{
						this.broadcast("Attaque_Rafraichir",[territoireattaque.nom, territoireattaque.army.toString(), territoiredefense.nom, territoiredefense.army.toString()])
						client.send("Reattaque_Combat",[territoireattaque.nom, territoireattaque.army.toString(), territoiredefense.nom, territoiredefense.army.toString()])
						state="inconnu"
//						state="deplacement"
//						console.log("le state a été mis en deplacement")
//						attaqueencours=false
//						this.broadcast("activePlayer",[state, this.state.players.get(IdActif).nom, this.state.players.get(IdActif).color])
					}
				}
			}
			else if(state=="deplacement"){
				if(territoire.proprietaire == client.sessionId && deplacementencours){
					var deplacemementvers = territoire
					console.log("on teste si c'est possible tkt")
					var chaine="deplacement depuis: " + deplacementdepuis.nom + " vers:" + deplacemementvers.nom
					console.log(chaine)
					var deplacementStatus = IsDeplacement_possible(deplacementdepuis,deplacemementvers)
					console.log(deplacementdepuis+deplacemementvers+deplacementStatus[0]+deplacementStatus[1])
					client.send("CombienDeplacer",[deplacementdepuis,deplacemementvers,deplacementStatus[0],deplacementStatus[1]])				
				}
				else if(territoire.proprietaire == client.sessionId && !deplacementencours && Deplacement_voisinLimitrophe(territoire)){
					deplacementdepuis = territoire
					console.log("le deplacement est en cours")
					console.log(deplacementdepuis.nom)
					deplacementencours=true
				}
			}
//			this.state.carte.set(message,territoire)
//			this.state.carte.forEach((value, index) => {
//				console.log(index+" : "+value.nom+", "+value.continent+", "+value.proprietaire+", "+value.army)
//			})
		})

		//Gestion des déplacements
		this.onMessage("Nbdeplacements",(client, message)=>{
			console.log("message reçu")
			if(message!="impossible"){
//				console.log("possible",message[0],message[1])
			console.log(this.state.carte.get(message[0].nom).army)
//			var territoiredepuis = new Territoire(message[0].nom,message[0].continent,message[0].proprietaire)
//			var territoirevers = new Territoire(message[1].nom,message[1].continent,message[1].proprietaire)
			var territoiredepuis = this.state.carte.get(message[0].nom)
			var territoirevers = this.state.carte.get(message[1].nom)
			territoiredepuis.army = message[0].army - message[2]
			territoirevers.army = message[1].army + message[2]
			this.state.carte.set(territoiredepuis.nom,territoiredepuis)
			this.state.carte.set(territoirevers.nom,territoirevers)
			PasserLaMain()
//				console.log("possible",message[0],message[1])

			this.state.players.get(IdActif).stock=calculRenforts(IdActif,this.state.carte)
			this.broadcast("carteChange", [this.state.players,this.state.carte])
			state="renforts"
			this.broadcast("activePlayer",[state, this.state.players.get(IdActif).nom, this.state.players.get(IdActif).color])
			console.log("broadcastdone")
			console.log(this.state.carte.get(message[0].nom).army)			
			}
			deplacementencours=false
		})

		//Gestion de l'attaque
		this.onMessage("Attaque_Confirmation",(client, message)=>{
			console.log("Attaque_Confirmation")
			if (message=="1") {
				state="attaque"
			}
			else {
				state="deplacement"
// Bug deplacement Territoire Isole
				if (! Deplacement_joueurpossedeterritoirenonisole(IdActif,this.state.carte)) {
					console.log("Changment Main Deplacement Renfort")
					PasserLaMain()
					state="renforts"
					this.state.players.get(IdActif).stock=calculRenforts(IdActif,this.state.carte)
					this.broadcast("carteChange", [this.state.players,this.state.carte])
					this.broadcast("activePlayer",[state, this.state.players.get(IdActif).nom, this.state.players.get(IdActif).color])
				}
				else {
					client.send("Deplacement_possible",[""])
				}
// Bug deplacement Territoire Isole
			}
			this.broadcast("activePlayer",[state, this.state.players.get(IdActif).nom, this.state.players.get(IdActif).color])
		})

// Bug deplacement Territoire Isole
		this.onMessage("Deplacement_Confirmation",(client, message)=>{ 
			if (message[0] == false){
				PasserLaMain()
				state="renforts"
				this.state.players.get(IdActif).stock=calculRenforts(IdActif,this.state.carte)
				this.broadcast("carteChange", [this.state.players,this.state.carte])
				this.broadcast("activePlayer",[state, this.state.players.get(IdActif).nom, this.state.players.get(IdActif).color])
			}
		})
// Bug deplacement Territoire Isole

		this.onMessage("Attaque_CombatTermine",(client, message)=>{
			console.log("Attaque_CombatTermine"+message)
			var attaquantPaysNom=message[0]
// Bug deplacement Territoire Isole
			var attaquantArmees=parseInt(message[1],10)
// Bug deplacement Territoire Isole
			var defenseurPaysNom=message[2]
// Bug deplacement Territoire Isole
			var defenseurArmees=parseInt(message[3],10)
// Bug deplacement Territoire Isole			
			var transfert=message[4]
			if (defenseurArmees == 0) {
				var attaquantPays=this.state.carte.get(attaquantPaysNom)
				var defenseurPays=this.state.carte.get(defenseurPaysNom)
				attaquantPays.army=attaquantArmees-transfert
				defenseurPays.army=transfert
				defenseurPays.proprietaire=attaquantPays.proprietaire
				territoireattaque=defenseurPays
				if (territoireattaque.army > 1 && Deplacement_ennemiLimitrophe(territoireattaque)) {
					this.broadcast("Attaque_Rafraichir",[territoireattaque.nom, territoireattaque.army.toString(), "", ""])
					state="reattaque"
				}
				else{
					state="deplacement"
					attaqueencours=false
				}
			}
			else {
				var attaquantPays=this.state.carte.get(attaquantPaysNom)
				attaquantPays.army=attaquantArmees
				state="deplacement"
				console.log("le state a été mis en deplacement")
				attaqueencours=false
			}
// Bug deplacement Territoire Isole
			if (state=="deplacement") {
				if (! Deplacement_joueurpossedeterritoirenonisole(IdActif,this.state.carte)) {
					console.log("Changment Main Deplacement Renfort 2")
					PasserLaMain()
					state="renforts"
					this.state.players.get(IdActif).stock=calculRenforts(IdActif,this.state.carte)
				}
				else {
					client.send("Deplacement_possible",[""])
				}
			}
// Bug deplacement Territoire Isole
			this.broadcast("carteChange", [this.state.players,this.state.carte])
			this.broadcast("activePlayer",[state, this.state.players.get(IdActif).nom, this.state.players.get(IdActif).color])
		})
					 
		
		//Implementer la fonction qui rempli la map carte en fonction du tableau javascript renvoyé !=
		this.onMessage("carte",(client, message)=>{
//			console.log("This :"+message);
//			console.log(message.length);
//			console.log(getVoisins("siberia"))
			for(var i = 0; i<42; i++){
				this.state.carte.set(message[i]['name'],new Territoire(message[i]['name'],message[i]['continent'],message[i]['proprietaire']))
				}
			for(var i = 0; i<42; i++){
				var L =[]
//				console.log(message[i]['name'])
//				console.log(getVoisins(message[i]['name']))
//				console.log(getVoisins(message[i]['name']).length)
//				for( var j = 0; j<getVoisins(message[i]['name']).length; j++){
//					L.push(this.state.carte.get(message[i]['name'][j]))
//				}
				getVoisins(message[i]['name']).forEach((name)=>{
					L.push(this.state.carte.get(name))
					if(this.state.carte.get(name)==undefined){console.log("erreur en "+message[i]['name']+" "+name)}
				})
				this.state.carte.get(message[i]['name']).voisins=L
//				console.log(message[i]['name'], getVoisins(message[i]['name']))
			}
			var peru = this.state.carte.get('peru')
//			console.log(peru)
//			console.log(getVoisins('argentina'))
	//		console.log(this.state.carte.get('argentina'))
		//	console.log(getVoisins('venezuela'))
//			console.log(this.state.carte.get('venezuela'))
	//		console.log(getVoisins('brazil'))
			var brazil = this.state.carte.get('brazil')
		//	console.log(brazil)
//			console.log(getVoisins('brazil'))
//			console.log("peru.voisins : "+this.state.carte.get('peru').voisins[0].voisins)
//			console.log("brasil.voisins : "+this.state.carte.get('peru').voisins[0].voisins[0].nom)
		})
		
		//LANCEMENT DE LA PARTIE !!! :D (la joie et le bonne humeur se répandent grâce à nous <3)
		var nbplayersstarted = 0
		this.onMessage("GetStarted",(client)=>{
			GameStarted = true
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
				this.broadcast("activePlayer",[state, this.state.players.get(IdActif).nom, this.state.players.get(IdActif).color])
			}
		})

		//Romain fonction abandonner
		this.onMessage("Abandon",(client)=>{
			client.send("Abandon_Confirmer",[""])
		})

		this.onMessage("Abandon_Confirmation",(client, message)=>{
			if (message == "1") {
				console.log(client.sessionId+" Abandon_Confirmation")
				const player = this.state.players.get(client.sessionId)
				this.broadcast("messages", [('('+client.sessionId+") : vient d'abandonner, quel nul !"),player.nom,player.color]);
				Order.splice(Order.indexOf(client.sessionId),1)
				console.log(IdActif, client.sessionId)
				if(IdActif==client.sessionId){
					PasserLaMain()
					if(state != "placementInitial"){
						state = "renforts"
						this.state.players.get(IdActif).stock=calculRenforts(IdActif,this.state.carte)
						}
					this.broadcast("carteChange", [this.state.players,this.state.carte])
				}
				if(Order.length==1){ //ceci ne s'active que si il n'y a plus qu'un joueur
					var gagnant = this.state.players.get(IdActif)
					this.broadcast("messages", [('('+IdActif+') : vient de conquérir le monde, quel boss !'),gagnant.nom,gagnant.color]);
					this.broadcast("VICTOIRE", gagnant.color)
					}
			}
		})
		//Romain fonction abandonner	

	}	

	onJoin (client, options) {
		if(GameStarted == true){throw new Error("Partie Complète")}
		else{
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
		this.broadcast("messages", [('('+client.sessionId+') : vient d\'arriver !'),player.nom,player.color]);
		}
	}

	onLeave (client, consented) {
		const player = this.state.players.get(client.sessionId)
		this.broadcast("messages", [('('+client.sessionId+') : vient malheureusement de partir !'),player.nom,player.color]);
		Order.splice(Order.indexOf(client.sessionId),1)
		console.log(IdActif, client.sessionId)
		if(IdActif==client.sessionId){
				PasserLaMain()
				if(state != "placementInitial"){
					state = "renforts"
					this.state.players.get(IdActif).stock=calculRenforts(IdActif,this.state.carte)
					}
				this.broadcast("carteChange", [this.state.players,this.state.carte])
			}
		if(Order.length==1){ //ceci ne s'active que si il n'y a plus qu'un joueur
			var gagnant = this.state.players.get(Idactif)
			this.broadcast("messages", [('('+IdActif+') : vient de conquérir le monde, quel boss !'),gagnant.nom,gagnant.color]);
			this.broadcast("VICTOIRE", gagnant.color)
			}
		//On actualise la liste des joueurs lorsqu'un joueur se déconnecte
		this.broadcast("listUserConnected", this.state.players);
		// 3 paramètre pour message : 1er : le message; 2eme : le pseudo, 3eme : la couleur
		console.log("Hey a bitch leave the room");
	}

	onDispose() {
		console.log("Dispose ChatRoom");
	}

} //fin de la classe

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


var colors = ['00FF00','FF00FF','FF0000','FFFF00','0000FF','00FFFF','787878','FFFFFF']

var newColors= [];
//Generation couleur aléatoire
function changeColorFunction(){
	color = '#'+colors[0]
	colors.shift();
//	var color = '#';
//	var randomNum = Math.floor(Math.random()*colors.length);
//	color += colors[randomNum]
//	console.log('randomNum : '+randomNum)
//	for(var i = 0; i<colors.length; i++)
//	{
//		if(i != randomNum)
//		{
//			newColors[i] = colors[i];
//		}
//	}
//	console.log('newColor : '+newColors)
//	colors = newColors;
//	var letters = '0123456789ABCDEF';
//	for (var i = 0; i < 6; i++) {
//		color += letters[Math.floor(Math.random() * 16)];
//	}
	console.log(color)
	console.log(colors)
	return color;
}

//Fonction initialisation des voisins
function getVoisins(name){
	if(name=="eastern_australia"){return ["western_australia","new_guinea","indonesia"]}
	if(name=="western_australia"){return ["eastern_australia","new_guinea","indonesia"]}
	if(name=="new_guinea"){return ["western_australia","eastern_australia","indonesia"]}
	if(name=="indonesia"){return ["western_australia","new_guinea","siam"]}
	if(name=="siam"){return ["indonesia","india","china"]}
	if(name=="india"){return ["siam","china","afghanistan","middle_east"]}
	if(name=="middle_east"){return ["russia","east_africa","egypt","afghanistan","india","southern_europe"]}
	if(name=="afghanistan"){return ["middle_east","india","china","russia","ural"]}
	if(name=="china"){return ["afghanistan","siam","india","ural","siberia","mongolia"]}
	if(name=="mongolia"){return ["china","siberia","japan","kamchatka","irkutsk"]}
	if(name=="japan"){return ["kamchatka","mongolia"]}
	if(name=="siberia"){return ["ural","china","mongolia","yakursk","irkutsk"]}
	if(name=="ural"){return ["russia","afghanistan","china","siberia"]}
	if(name=="irkutsk"){return ["mongolia","siberia","kamchatka","yakursk"]}
	if(name=="yakursk"){return ["irkutsk","kamchatka","siberia"]}
	if(name=="kamchatka"){return ["irkutsk","yakursk","japan","mongolia","alaska"]}
	if(name=="russia"){return ["ural","afghanistan","middle_east","southern_europe","northern_europe","scandinavia"]}
	if(name=="scandinavia"){return ["russia","iceland","great_britain","northern_europe"]}
	if(name=="northern_europe"){return ["southern_europe","russia","scandinavia","western_europe","great_britain"]}
	if(name=="southern_europe"){return ["egypt","north_africa","middle_east","western_europe","russia"]}
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
	if(name=="east_africa"){return ["egypt","middle_east","north_africa","congo","madagascar","south_africa"]}
	if(name=="madagascar"){return ["south_africa","east_africa"]}
	if(name=="south_africa"){return ["madagascar","congo","east_africa"]}
	if(name=="congo"){return ["south_africa","north_africa","east_africa"]}
//	var M =[]
//	L.forEach((nom)=>{
//		M.push(this.state.get(nom))
//	})
//	return M
	
}

// Savoir s'il y a un ennemi limitrophe
function Deplacement_ennemiLimitrophe(Territoire){
	if (Territoire.army < 2) {return false}
    for (var i=0 ; i < Territoire.voisins.length ; i++){
        if (Territoire.proprietaire != Territoire.voisins[i].proprietaire ){
            return true
        }
    }
	console.log("pas d'ennemi limitrophe" + Territoire.nom)
    return false
}

//Savoir si il y a un voisin limitrophe
function Deplacement_voisinLimitrophe(Territoire){
//	if (Territoire.army < 2) {return false}
	for (var i=0 ; i < Territoire.voisins.length ; i++){
        if (Territoire.proprietaire == Territoire.voisins[i].proprietaire ){
            return true
        }
    }
	console.log("pas de voisin limitrophe" + Territoire.nom)
    return false
}


//Savoir si le territoire se trouve parmi une liste
function Deplacement_estPresent(Territoire,liste){
    for(var i =0;i < liste.length;i++){
        if (liste[i].nom == Territoire.nom){
            return true
        }
    }
    return false
}

//Renvoie une liste des terrioires voisins avec même propriétaire
function Deplacement_voisinsMemeProprio(Territoire){
    voisins = []
//	console.log(Territoire.nom, Territoire.army, Territoire.proprietaire, Territoire.voisins)
    for (var i =0 ; i < Territoire.voisins.length ; i++){
        if (Territoire.proprietaire == Territoire.voisins[i].proprietaire ){
            voisins.push(Territoire.voisins[i])
        }
    }
    return voisins
}

//Savoir si l'on va pouvoir effectuer le déplacement
function Deplacement_sontRelies(Territoire1,Territoire2){
//	console.log(Territoire1,Territoire2,"c")
    var status = false;
    var passes = [];
    var encours = [];
    encours.push(Territoire1);
    while( !status && (encours.length != 0) ){
        var terri = encours.shift()
        passes.push(terri)
//		console.log("terri : "+terri.nom, terri.army, terri.proprietaire, terri.voisins)
        var voisinsMemeProprio = Deplacement_voisinsMemeProprio(terri)
        for (var i = 0; i < voisinsMemeProprio.length;i++){
            if (voisinsMemeProprio[i].nom == Territoire2.nom){
                return true
            }
            var presentEnCours = Deplacement_estPresent(voisins[i],encours)
            var presentPasses = Deplacement_estPresent(voisins[i],passes)
            if (!presentEnCours && !presentPasses){
                encours.push(voisins[i])
            }
        }
    }
    return false
}

//Effectuer le déplacement
function IsDeplacement_possible(Territoire1,Territoire2){
    var possible = Deplacement_sontRelies(Territoire1,Territoire2)
//	console.log(possible, Territoire1.army, Territoire1.name ,"b")
//    if(possible && Territoire1.army > 1 && Territoire1!=Territoire2){
	if(possible && Territoire1!=Territoire2){
        var max = Territoire1.army - 1
		return [true,max]
    }
    return [false,-1]
}


//fonctions qui vont voir si le combat est possible initialement

// Savoir si 2 territoires sont voisins
function Combat_estVoisin(Territoire1,Territoire2){
    for(var i =0 ; i < Territoire1.voisins.length ;i++){
        if (Territoire1.voisins[i].nom == Territoire2.nom ) {
            return true
        }
    }
    return false
}

//Savoir si l'attaque est possible
function Combat_attaquePossible (Territoire1,Territoire2) {
    var voisin = Combat_estVoisin(Territoire1,Territoire2) ;
    var assezArmees = (Territoire1.army > 1) ;
    var voisinsDifferents = (Territoire1.proprietaire != Territoire2.proprietaire);
    if (voisin && assezArmees && voisinsDifferents){
        return true
    }
    else {
        return false
    }
}

// Bug deplacement Territoire Isole
// Savoir si un deplacement est possible
function Deplacement_joueurpossedeterritoirenonisole(Id,carte) {
	var possedeterritoirenonisole = false
    carte.forEach((territoire)=>{
        if(territoire.proprietaire==Id){
			console.log("Territoire: "+ territoire.nom+" appartient à: " + Id)
            var status = Deplacement_voisinLimitrophe(territoire)
            if (status){
				console.log("Deplacement_joueurpossedeterritoirenonisole : true" + Id)
                possedeterritoirenonisole = true
            }
        }
    })
	console.log("Deplacement_joueurpossedeterritoirenonisole : " + possedeterritoirenonisole)
	return(possedeterritoirenonisole)
}
// Bug deplacement Territoire Isole

//	calcul des renforts
	 function calculRenforts(Id,carte){
		var nbTerritoires = 0
		var NA = 0
		var SA = 0
		var EU = 0
		var Oceanie = 0
		var Asie = 0
		var Afrique = 0
		carte.forEach((territoire)=>{
			if(territoire.proprietaire==Id){
				nbTerritoires++
				if(territoire.continent=="NA"){NA++}
				if(territoire.continent=="SA"){SA++}
				if(territoire.continent=="EU"){EU++}
				if(territoire.continent=="Oceanie"){Oceanie++}
				if(territoire.continent=="Afrique"){Afrique++}
				if(territoire.continent=="Asie"){Asie++}			
				}
			})
		var total = Math.floor(nbTerritoires/3)
//		console.log("14?",total, nbTerritoires)
		if(NA==9){total+=5}
		if(SA==4){total+=2}
		if(EU==7){total+=5}
		if(Oceanie==4){total+=2}
		if(Asie==12){total+=7}
		if(Afrique==6){total+=3}
		console.log(total)
		if(total>3){return total}
		else{return 3}
	}



				