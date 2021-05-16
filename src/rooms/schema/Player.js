const schema = require('@colyseus/schema');
const Schema = schema.Schema;


class Player extends Schema{
	constructor(){
		super();
		this.nom = "JeanMi";
		this.color = "red";
		this.stock = 0;
		this.alive = true;
	}
}
schema.defineTypes(Player, {
	nom: "string",
	color: "string",
	stock: "number",
	alive: "boolean"
});

exports.Player = Player
