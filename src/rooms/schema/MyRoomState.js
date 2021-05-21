const schema = require('@colyseus/schema');
const Player = require('./Player').Player
const Territoire = require('./Territoire').Territoire

class MyRoomState extends schema.Schema {

	constructor(){
		super();
		this.players = new schema.MapSchema();
		this.carte = new schema.MapSchema();
		this.carteInit = false;
	}
}
		
schema.defineTypes(MyRoomState,{
	players: {map: Player },
	carte: {map:Territoire},
	carteInit:"boolean",
})

exports.MyRoomState = MyRoomState;