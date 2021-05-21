var host = window.document.location.host.replace(/:.*/, '');
	  var autoScroll = 0;
      var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':'+location.port : ''));


      client.joinOrCreate("chat").then(room => {
        room.onStateChange.once(function(state) {
        });

        // new room state
        room.onStateChange(function(state) {
            // this signal is triggered on each patch
        });


//========================= MESSAGES QUE LE CLIENT ATTENDS DU SERVEUR =========================//

		//Affichage mes messages dans la chatbox
        room.onMessage("messages", function(message) {
			chatBox = document.getElementById('chatBox')
			chatBox.innerHTML += ('<div style="color:'+message[2]+';" class="messages"><strong>'+message[1]+' : </strong><span style="color:black;">'+message[0]+'</span></div>')
			autoScroll+=100
			document.getElementById('chatBox').scroll(0,autoScroll);
        });



		//Envoie au serveur la liste des territoires en les lisant dans le code svg de la carte
		room.onMessage("CarteInit", function(message){
			var territoires = document.getElementsByTagName("g")[1]
			for(var i = 0; i<territoires.children.length; i++){
				message[i] = 
				{
					"name": territoires.children[i].id,
				 	"continent":territoires.children[i].className['animVal'],
			 		"proprietaire":"none",
				}
			}
			room.send("carte",message)
		});
		
		
		//Met à jour la carte
		room.onMessage("carteChange",function(message){
			for (const[key, value] of Object.entries(message[1])){
				var territoire = document.getElementById(key)
				var army = document.getElementById(key+"Army")
				if(army != null){army.innerHTML=value.army}
				if(value.proprietaire != "none"){
					territoire.style.fill = message[0][value.proprietaire].color
				}
			}
			stockList = document.getElementById('stockList')
			stockList.innerHTML = ''
			for(const[key, value] of Object.entries(message[0]))
			{
				stockList.innerHTML += ('<span style="color:'+value.color+'"><strong>'+value.nom+'</strong> a <strong>'+value.stock+'</strong> pions à placer'+'</span></br>')
			}
		})
		
		
		//Met à jour la liste des utilisateurs
		room.onMessage("listUserConnected", function(message){
			listUser = document.getElementById('userList')
			listUser.innerHTML = ''
			for(const[key, value] of Object.entries(message))
			{
				listUser.innerHTML += ('<li style="color:'+value.color+'"><span id="'+key+'" ><strong>'+value.nom+'</strong> ('+key+')'+'</span></li>')
			}
		})
		room.onMessage("activePlayer", function(message){
			document.getElementById("joueurActifDisplay").style.color=message[2]
			document.getElementById("joueurActifDisplay").innerHTML="<h6 class='fontArrh6' style='display:inline'>Phase</h6> : " + message[0]+ "<br>" + message[1] + " est en train de jouer"
		})



		//disparition du bouton lancer la partie, affichage du bouton Abandonner la partie
		room.onMessage("GameHasStarted",function(){
			document.getElementById("GetStarted").style.display = "none"
			document.getElementById("Abandon").style.display = "block"
		})

		//Demande de confirmation pour capituler
		room.onMessage("Abandon_Confirmer",function(){
			var abandon="0"
			if (window.confirm("Voulez-vous vraiment abandonner?")) {
				abandon="1"
			}
			room.send("Abandon_Confirmation",[abandon])		
		})



		//Envoi au serveur le nombre de pions que le joueru veut déplacer 
		room.onMessage("CombienDeplacer",function(message){
			if(message[2] == false){
				alert("Vous ne pouvez pas effectuer ce déplacement")
				room.send("Nbdeplacements","impossible")
				}
			else{
			var deplacemement = parseInt(prompt("Choisissez un nombre d'armées à déplacer entre 0 et "+message[3]))
			while(isNaN(deplacemement) || deplacemement < 0 || deplacemement > message[3] ){
					deplacemement = parseInt(prompt("Erreur!! Choisissez un nombre d'armées à déplacer entre 0 et "+message[3]))
			}
			room.send("Nbdeplacements",[message[0],message[1],deplacemement])
			}
		})


		//Confirmation de l'attaque
		room.onMessage("Attaque_Confirmer",function(message){
			stockList = document.getElementById('stockList')
			stockList.innerHTML = ''
			if (window.confirm("Voulez-vous effectuer une attaque?")) {
				attackInfo = document.getElementById('attackInfo')
				if (message[0]== "") {
					attackInfo.innerHTML = '<p>Selectionner un pays</p>'
				}
				else {
					attackInfo.innerHTML = message[0]
				}
				attaque="1"
			}
			else {
				attaque="0"
			}

			room.send("Attaque_Confirmation",[attaque])
		})



		//Affichage des territoires impliqués dans le combat		
		room.onMessage("Attaque_Rafraichir",function(message){
			stockList = document.getElementById('stockList')
			stockList.innerHTML = ''
			attackInfo = document.getElementById('attackInfo')
			attackInfo.innerHTML = "<p>Att:" + message[0] + "(" + message [1] + ")</p>"
			if (message[2] == "") {
				attackInfo.innerHTML += "<p>Selectionner un pays</p>"
			}
			else {
				attackInfo.innerHTML += "<p>Def:" + message[2] + "(" + message [3] + ")</p>"
			}
		})


		//Effectue le combat et gère le transfert des troupes si l'attaquant gagne	
		room.onMessage("Attaque_Combat",function(message){
			stockList = document.getElementById('stockList')
			stockList.innerHTML = ''
			attackInfo = document.getElementById('attackInfo')
			attackInfo.innerHTML = ''
			resultat=Combat(message[0],message[1],message[2],message[3])
			var defenseurArmees=resultat[3]
			var maxTransfert=resultat[1]-1
			var transfert = 0
			if (defenseurArmees == 0) {
				var transfert = parseInt(prompt("Choisissez un nombre d'armées à transférer entre 1 et " + maxTransfert))
				while(isNaN(transfert) || transfert < 1 || transfert > maxTransfert ){
					transfert = parseInt(prompt("Erreur!! Choisissez un nombre d'armées à transférer entre 0 et " + maxTransfert))
				}				
			}
			room.send("Attaque_CombatTermine",[resultat[0],resultat[1],resultat[2],resultat[3],transfert])
		})
		
		//Demande au joueur si il veut réattaquer si il a gagné et gère le nouveau combat si oui
		room.onMessage("Reattaque_Combat",function(message){
			stockList = document.getElementById('stockList')
			stockList.innerHTML = ''
			attackInfo = document.getElementById('attackInfo')
			attackInfo.innerHTML = ''
			msg="Att: "+ message[0] + "(" + message[1] + ") contre Def: " + message[2] + "(" + message[3] + ")\n"
			msg += "Confirmez-vous l'attaque de ce territoire ? Vous pouvez également arrêter d'attaquer pour ce tour"
			confirmationCombat=window.confirm(msg)
			if (confirmationCombat == true) {
				resultat=Combat(message[0],message[1],message[2],message[3])
				var defenseurArmees=resultat[3]
				var maxTransfert=resultat[1]-1
				var transfert = 0
				if (defenseurArmees == 0) {
					var transfert = parseInt(prompt("Choisissez un nombre d'armées à transférer entre 1 et " + maxTransfert))
					while(isNaN(transfert) || transfert < 1 || transfert > maxTransfert ){
						transfert = parseInt(prompt("Erreur!! Choisissez un nombre d'armées à transférer entre 0 et " + maxTransfert))
					}		
				}
				room.send("Attaque_CombatTermine",[resultat[0],resultat[1],resultat[2],resultat[3],transfert])
			}
			else {
				room.send("Attaque_CombatTermine",[message[0],message[1],message[2],message[3],0])
			}
			
		})
		
		//Demande au joueur si il souhaite se déplacer
		room.onMessage("Deplacement_possible",function(message){ 
			var dep = window.confirm("Voulez-vous effectuer un déplacement?")
			room.send("Deplacement_Confirmation",[dep])
		})

		
		//Animation de victoire
		room.onMessage("VICTOIRE",function(message){
			var territoires = document.getElementsByTagName("g")[1]
			for(var i = 0; i<territoires.children.length; i++){
				territoires.children[i].style.fill=message
				//c'est ici que tu peux mettre la musique Louis <3
				}
			})					

//=============================================================================================//

//================================== EVENTLISTENERS ===========================================//

        //Bouton "send" du chat
        document.querySelector("#form").onsubmit = function(e) {
            e.preventDefault();
            var input = document.querySelector("#input");
            room.send("message", input.value);
            input.value = "";
        }
		
		
		//Bouton pour changer de pseudo
		document.querySelector("#formUsername").onsubmit = function(e){
			e.preventDefault();
			var inputUsername = document.querySelector("#inputUsername");
			room.send("author",inputUsername.value)
		}
		
		
		//Bouton "lancer la partie"		
		document.querySelector("#GetStarted").onsubmit = function(e){
			e.preventDefault();
			room.send("GetStarted")
		}


		//Bouton capituler	
		document.querySelector("#Abandon").onsubmit = function(e){
			e.preventDefault();
			room.send("Abandon")
		}

		
		//Ecoute les clicks sur tous les territoires
		var territoires = document.getElementsByTagName("g")[1]
		for(var i = 0; i<territoires.children.length; i++){
		document.getElementById(territoires.children[i].id).addEventListener("click",function(){
		var message = this.id
		room.send("territoireClicked",message)
		})
		}
    });

//Effet de survol qui affiche les continents 	
var color = []
var InfoContinents=document.getElementById("ShowContinents")
InfoContinents.addEventListener("mouseover",function(){
	var NA = document.getElementsByClassName("NA")
	for (let territoire of NA) {
	color.push(territoire.style.fill)
	territoire.style.fill="yellow"}
	var SA = document.getElementsByClassName("SA")
	for (let territoire of SA) {
	color.push(territoire.style.fill)
	territoire.style.fill="red"}
	var EU = document.getElementsByClassName("EU")
	for (let territoire of EU) {
	color.push(territoire.style.fill)
	territoire.style.fill="blue"}	
	var Afrique = document.getElementsByClassName("Afrique")
	for (let territoire of Afrique) {
	color.push(territoire.style.fill)
	territoire.style.fill="brown"}
	var Asie = document.getElementsByClassName("Asie")
	for (let territoire of Asie) {
	color.push(territoire.style.fill)
	territoire.style.fill="green"}
	var Oceanie = document.getElementsByClassName("Oceanie")
	for (let territoire of Oceanie) {
	color.push(territoire.style.fill)
	territoire.style.fill="violet"}	
})
InfoContinents.addEventListener("mouseout",function(){
	var ContinentList = ["NA","SA","EU","Afrique","Asie","Oceanie"]
	for(var i=0; i<ContinentList.length; i++){
		var Continent = document.getElementsByClassName(ContinentList[i])
		for (let territoire of Continent) {
		territoire.style.fill=color.shift()}
	}		
})

//====================================================================================================//

//================================== FONCTIONS LIEES AU COMBAT =======================================//

//tableau trié ordre croissant des num lancés de dés
	function Combat_lanceDe (num) {
		var result = []
		for (var i =0; i<num; i++){
			var a = Math.floor(Math.random() * 6) + 1;
			result.push(a)
		}
		return result.sort()
	}

//Donne le dé gagnant lorsqu'on compare 2 dés
	function Combat_compareDeAttDef(a,b){
		if(a<b){return -1}
		else if(a>b){return 1}
		else {return 0}
	}

//renvoie la taille du tableau le plus petit
	function size (tab1,tab2){
		var min = Combat_compareDeAttDef(tab1.length ,tab2.length)
		if( min == 1){return tab2.length}
		else {return tab1.length}
	}

//renvoie le résultat du combat
	function Combat_comparison(tab1,tab2) {
		var lon = size(tab1,tab2)
		var tab = []
		for(var i = 0; i < lon ; i++){
			var c = Combat_compareDeAttDef(tab1[tab1.length-1-i],tab2[tab2.length-1-i]);
			tab.push(c)
		}
		return tab
	}

// renvoie le nombre de combattants perdus dans chaque camp
	function Combat_nbperdu(tab){
		var atta = 0;
		var defen = 0;
		for(var i = 0; i< tab.length ;i++){
			if (1 == tab[i]) {defen += 1}
			else {atta +=1}
		}
		return [atta,defen]
	}


//demande à l'attaquant si il veut continuer le combat après chaque combat de dé
	function Combat_continue(msg){
		return confirm(msg)
	}

//Renvoie le nombre de combattans avec lequel l'attaquant combat à chaque tour de dé (1,2 ou 3),
	function Combat_NombreAttaquants (attaquantArmees) {
		if (attaquantArmees > 3){return 3}
		else if (attaquantArmees == 3){return 2}
		else if (attaquantArmees == 2){return 1}
	}

//Renvoie le nombre de combattans avec lequel l'attaquant combat à chaque tour de dé (1 ou 2)
	function Combat_NombreDefenseurs (defenseurArmees) {
		if (defenseurArmees > 1){return 2}
		else if (defenseurArmees == 1){return 1}
	}

//effectue le combat entre un pays attaquant et un pays défenseur
	function Combat (attaquantPays,attaquantArmees,defenseurPays,defenseurArmees){
		console.log(attaquantPays + defenseurPays)
		combattre=true
		while (combattre == true && defenseurArmees>0 && attaquantArmees>1) {
			var numatt = Combat_NombreAttaquants (attaquantArmees);
			var numdef = Combat_NombreDefenseurs (defenseurArmees);
			var tabpertes = Combat_nbperdu(Combat_comparison(Combat_lanceDe(numatt),Combat_lanceDe(numdef)))
			attaquantArmees -= tabpertes[0]
			defenseurArmees -= tabpertes[1]
			var msg="Vous venez de perdre " +tabpertes[0]+ " combattant(s) et votre ennemi vient d'en perdre " +tabpertes[1]+ ".\n"
			msg+=attaquantPays + "(" + attaquantArmees + ") vs. " + defenseurPays + "(" + defenseurArmees + ").\n"
			msg+="Voulez vous-continuer votre attaque ?"
			combattre = Combat_continue(msg)
		}
		if (defenseurArmees == 0) {
			alert("Bravo!! Vous venez de conquérir un territoire")
		}
		else if (attaquantArmees == 1) {
			alert("Vous n'avez plus d'armées pour attaquer, Désolé")
		}
		else if (combattre == false) {
			alert("Vous avez décidé d'arrêter de combattre, on en reste là!")
		}
		return([attaquantPays,attaquantArmees,defenseurPays,defenseurArmees])
	}

//====================================================================================================//
