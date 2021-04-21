var host = window.document.location.host.replace(/:.*/, '');

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
			chatBox.innerHTML += ('<span style="color:'+message[2]+';">'+message[1]+' : '+message[0]+'</span></br>')
//            var p = document.createElement("p");
//            p.innerText = message;
//            document.querySelector("#chatBox").appendChild(p);
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
				stockList.innerHTML += ('<span style="color:'+value.color+'">'+value.nom+' a '+value.stock+' pions à placer'+'</span></br>')
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
				listUser.innerHTML += ('<span id="'+key+'" style="color:'+value.color+'">'+key+' ('+value.nom+')'+'</span></br>')
			}
//			message.forEach(function(){console.log(value, key)})
			
//			for(var i=0; i< message.length; i++){
//				console.log(message[i])
//			}
		})
		
		room.onMessage("activePlayer", function(message){
			document.getElementById("joueurActifDisplay").style.color=message[1]
			document.getElementById("joueurActifDisplay").innerHTML=message[0]+" est en train de jouer"
		})
		
		room.onMessage("GameHasStarted",function(){
			document.getElementById("GetStarted").style.display = "none"
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
