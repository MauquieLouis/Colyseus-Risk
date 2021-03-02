const schema = require('@colyseus/schema');
const Schema = schema.Schema;


class Player extends Schema{
	constructor(){
		super();
		this.nom = "JeanMi";
		this.color = "red";
	}
}
schema.defineTypes(Player, {
	nom: "string",
	color: "string",
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