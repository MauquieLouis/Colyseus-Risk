const schema = require('@colyseus/schema');
const Schema = schema.Schema;


class Player extends Schema{
	constructor(){
		super();
		this.nom = "JeanMi";
		this.color = "red";
		this.stock = 0;
	}
}
schema.defineTypes(Player, {
	nom: "string",
	color: "string",
	stock: "number"
});

exports.Player = Player
