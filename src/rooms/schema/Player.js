const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const MapSchema = schema.MapSchema;

class Player extends schema.Schema {}
	
	schema.defineTypes(Player, {
  	pseudo: "string",
	color: "string",
	});

class MyState extends Schema {
	constructor(){
		super();
		
		//this.player = new Player();
		this.players = new MapSchema();
	}
}

schema.defineTypes(MyState, {
	players : { map: Player }
})
//schema.defineTypes(MyState,{
//	player: Player
//});

//exports.Player = Player;