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
            var p = document.createElement("p");
            p.innerText = message;
            document.querySelector("#chatBox").appendChild(p);
        });
		
		// Initialisation de la matrice : afficahge côté client
		room.onMessage("matrixInit", function(message) {
			console.log('message 0 : '+message[1])
			matrixZone = document.getElementById('matrix')
			matrixZone.innerHTML = '';
			for(var i=0; i<message[0].length; i++){
				for(var j=0; j<message[0].length; j++){
					var div = document.createElement('div')
					div.id = i+'.'+j
					div.style = "display:inline-block; height:40px; width:40px; border:1px solid black;"
					matrixZone.appendChild(div)
					//matrixZone.innerHTML+=("<div id='"+i+"."+j+"'style='display:inline-block; height:40px; width:40px; border:1px solid black;'></div>")
//					console.log(document.getElementById("0.0").addEventListener("click",function(){console.log("Hey")}))			
				}
				matrixZone.innerHTML+=("</br>")
			}
			setTimeout(function(){
				for(var i=0; i<message[0].length; i++){
					for(var j=0; j<message[0].length; j++){
						document.getElementById(i+'.'+j).addEventListener("click",function(){
						coord = this.id.split(".")
						room.send("caseClicked", coord)
						})			
					}
				}
			},20)
        });
		room.onMessage("matrixChange", function(message){
//			console.log('matrixChange')
//			console.log(message)
			for(var i=0; i<message.length; i++){
				for(var j=0; j<message.length; j++){
					if(message[i][j] != document.getElementById(i+'.'+j).value){
						document.getElementById(i+'.'+j).style.backgroundColor = message[i][j]
					}
				}
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