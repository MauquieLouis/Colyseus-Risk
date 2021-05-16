var host = window.document.location.host.replace(/:.*/, '');
	  var autoScroll = 0;
      var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':'+location.port : ''));
      client.joinOrCreate("chat").then(room => {
        console.log("joined the room");
		console.log(client)
        room.onStateChange.once(function(state) {
            console.log("initial room state:", state);
        });
        // new room state
        room.onStateChange(function(state) {
            // this signal is triggered on each patch
        });
        // listen to patches coming from the server
        room.onMessage("messages", function(message) {
			chatBox = document.getElementById('chatBox')
			console.log(message)
			chatBox.innerHTML += ('<div style="color:'+message[2]+';" class="messages"><strong>'+message[1]+' : </strong><span style="color:black;">'+message[0]+'</span></div>')
//            var p = document.createElement("p");
//            p.innerText = message;
//            document.querySelector("#chatBox").appendChild(p);
			autoScroll+=100
			document.getElementById('chatBox').scroll(0,autoScroll);
        });
		
		room.onMessage("CarteInit", function(message){
			console.log(message)
			var territoires = document.getElementsByTagName("g")[1]
			for(var i = 0; i<territoires.children.length; i++){
				message[i] = 
				{
					"name": territoires.children[i].id,
				 	"continent":territoires.children[i].className['animVal'],
			 		"proprietaire":"none",
				}
				console.log(territoires[i])
			}
			room.send("carte",message)
		});
		
		room.onMessage("carteChange",function(message){
//			console.log(message[0])
//			console.log(message[1])
			for (const[key, value] of Object.entries(message[1])){
//				console.log(key+" : "+value.nom)
				var territoire = document.getElementById(key)
				var army = document.getElementById(key+"Army")
				if(army != null){army.innerHTML=value.army}
				if(value.proprietaire != "none"){
//					console.log(message[0][value.proprietaire].color)
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
		
		// Initialisation de la matrice : afficahge côté client
//		room.onMessage("matrixInit", function(message) {
//			matrixZone = document.getElementById('matrix')
//			matrixZone.innerHTML = '';
//			for(var i=0; i<message.length; i++){
//				for(var j=0; j<message.length; j++){
//					var div = document.createElement('div')
//					div.id = i+'.'+j
//					div.style = "display:inline-block; height:40px; width:40px; border:1px solid black;"
//					matrixZone.appendChild(div)
//					//matrixZone.innerHTML+=("<div id='"+i+"."+j+"'style='display:inline-block; height:40px; width:40px; border:1px solid black;'></div>")
////					console.log(document.getElementById("0.0").addEventListener("click",function(){console.log("Hey")}))			
//				}
//				matrixZone.innerHTML+=("</br>")
//			}
//			setTimeout(function(){
//				for(var i=0; i<message.length; i++){
//					for(var j=0; j<message.length; j++){
//						document.getElementById(i+'.'+j).addEventListener("click",function(){
//						coord = this.id.split(".")
//						room.send("caseClicked", coord)
//						})			
//					}
//				}
//			},20)
//        });
//		room.onMessage("matrixChange", function(message){
////			console.log('matrixChange')
////			console.log(message)
//			for(var i=0; i<message.length; i++){
//				for(var j=0; j<message.length; j++){
//					if(message[i][j] != document.getElementById(i+'.'+j).value){
//						document.getElementById(i+'.'+j).style.backgroundColor = message[i][j]
//					}
//				}
//			}
//		})
		
		room.onMessage("listUserConnected", function(message){
			listUser = document.getElementById('userList')
			listUser.innerHTML = ''
			for(const[key, value] of Object.entries(message))
			{
				console.log(key+" : "+value.nom+" : "+value.color)
				listUser.innerHTML += ('<li style="color:'+value.color+'"><span id="'+key+'" ><strong>'+value.nom+'</strong> ('+key+')'+'</span></li>')
			}
//			message.forEach(function(){console.log(value, key)})
			
//			for(var i=0; i< message.length; i++){
//				console.log(message[i])
//			}
		})
		//Display ActivePlayer
		room.onMessage("activePlayer", function(message){
			document.getElementById("joueurActifDisplay").style.color=message[2]
			document.getElementById("joueurActifDisplay").innerHTML="<h6 class='fontArrh6' style='display:inline'>Phase</h6> : " + message[0]+ "<br>" + message[1] + " est en train de jouer"
		})

		//disparition du bouton lancer la partie, affichage du bouton Abandonner la partie
		room.onMessage("GameHasStarted",function(){
			document.getElementById("GetStarted").style.display = "none"
//Romain fonction abandonner
			document.getElementById("Abandon").style.display = "block"
//Romain fonction abandonner
		})

//Romain fonction abandonner
		room.onMessage("Abandon_Confirmer",function(){
			var abandon="0"
			if (window.confirm("Voulez-vous vraiment abandonner?")) {
				abandon="1"
			}
			room.send("Abandon_Confirmation",[abandon])		
		})
//Romain fonction abandonner

		room.onMessage("CombienDeplacer",function(message){
			console.log("a"+message[2])
			if(message[2] == false){
				alert("Vous ne pouvez pas effectuer ce déplacement")
				room.send("Nbdeplacements","impossible")
				}
			else{
			var deplacemement = parseInt(prompt("Choisissez un nombre d'armées à déplacer entre 0 et "+message[3]))
			while(isNaN(deplacemement) || deplacemement < 0 || deplacemement > message[3] ){
					deplacemement = parseInt(prompt("Erreur!! Choisissez un nombre d'armées à déplacer entre 0 et "+message[3]))
			}
			console.log("message envoyé "+ deplacemement)
			room.send("Nbdeplacements",[message[0],message[1],deplacemement])
			}
		})

// Attaques
		room.onMessage("Attaque_Confirmer",function(message){
			console.log("Attaque_Confirmer"+message[0])
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
		
		room.onMessage("Attaque_Rafraichir",function(message){
			console.log("Attaque_Rafraichir"+message[0])
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
		
		room.onMessage("Attaque_Combat",function(message){
			console.log("Attaque_Combat"+message[0])
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
		
		room.onMessage("Reattaque_Combat",function(message){
			console.log("Reattaque_Combat"+message[0])
			stockList = document.getElementById('stockList')
			stockList.innerHTML = ''
			attackInfo = document.getElementById('attackInfo')
			attackInfo.innerHTML = ''
			msg="Att: "+ message[0] + "(" + message[1] + ") contre Def: " + message[2] + "(" + message[3] + ")\n"
			msg += "Confirmez-vous l'attaque?"
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
				

        // send message to room on submit
        document.querySelector("#form").onsubmit = function(e) {
            e.preventDefault();

            var input = document.querySelector("#input");

//            console.log("input:", input.value);

            // send data to room
            room.send("message", input.value);

            // clear input
            input.value = "";
        }
		
		document.querySelector("#formUsername").onsubmit = function(e){
			e.preventDefault();
			var inputUsername = document.querySelector("#inputUsername");
//			console.log("inputUsername: ",inputUsername.value)
			room.send("author",inputUsername.value)
		}
		
//GetStarted		
		document.querySelector("#GetStarted").onsubmit = function(e){
			e.preventDefault();
			room.send("GetStarted")
		}

		//Romain fonction abandonner		
		document.querySelector("#Abandon").onsubmit = function(e){
			e.preventDefault();
			room.send("Abandon")
		}
		//Romain fonction abandonner


		
		var territoires = document.getElementsByTagName("g")[1]
		//console.log(territoires.children)
		for(var i = 0; i<territoires.children.length; i++){
	document.getElementById(territoires.children[i].id).addEventListener("click",function(){
	console.log(this.id);
	var message = this.id
	room.send("territoireClicked",message)
	})
}
    });

	function changeColorFunction(){
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
	//	console.log(color)
		return color;
	}
//function coord(event){
//
////var e = event || window.event;
////console.log(e.layerX,e.layerY)
////}
////var map = document.getElementById('map')
////map.addEventListener("click", function(){
////	var coord = elementPosition(map);
////	console.log(map)
////	console.log(coord)
////})


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
