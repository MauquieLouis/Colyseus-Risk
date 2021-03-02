const schema = require('@colyseus/schema');
const Schema = schema.Schema;


class Player extends Schema{
	constructor(){
		super();
		this.nom = "JeanMi";
		this.color = "red";
		this.connected = 0;
	}
}
schema.defineTypes(Player, {
	nom: "string",
	color: "string",
	connected:"number",
});

exports.Player = Player

/*class PlayerState extends Schema{
	constructor(){
		super();
		this.players = new schema.MapSchema();
	}
	
}
schema.defineTypes(PlayerState,{
	players: {map: exports.Player }
})*/

//exports.PlayerState = PlayerState