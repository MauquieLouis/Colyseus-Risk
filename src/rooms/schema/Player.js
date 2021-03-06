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
