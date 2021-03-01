console.log("HEYYYY !")
var host = window.document.location.host.replace(/:.*/, '');

      var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':'+location.port : ''));
      client.joinOrCreate("chat").then(room => {
        console.log("joined the room");
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

/*		room.onMessage("newUserJoin", function(message){
			addUserToConnectList(message);
		})

		room.onMessage("getAllUser",function(message){
			
		});*/
        // send message to room on submit
        document.querySelector("#form").onsubmit = function(e) {
            e.preventDefault();

            var input = document.querySelector("#input");

            console.log("input:", input.value);

            // send data to room
            room.send("message", input.value);

            // clear input
            input.value = "";
        }
		document.querySelector("#formUsername").onsubmit = function(e){
			e.preventDefault();
			var inputUsername = document.querySelector("#inputUsername");
			console.log("inputUsername: ",inputUsername.value)
			room.send("author",inputUsername.value)
		}
      });

function addUserToConnectList(username){
	connectList = document.getElementById('UserConnected');
	connectList.innerHTML += '<p id="'+username+'">'+username+'</p>'
}

function removeUserToConnectList(){
	
}
function refreshConnectList(){
	
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