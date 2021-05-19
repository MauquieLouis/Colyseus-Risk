const schema = require('@colyseus/schema');
const Player = require('./Player').Player
const Matrix = require('./Matrix').Matrix
const Territoire = require('./Territoire').Territoire

class MyRoomState extends schema.Schema {

	constructor(){
		super();
		this.players = new schema.MapSchema();
		this.matrix = new Matrix();
		this.carte = new schema.MapSchema();
		this.carteInit = false;
	}
}
		
schema.defineTypes(MyRoomState,{
	players: {map: Player },
	matrix: Matrix,
	carte: {map:Territoire},
	carteInit:"boolean",
})

exports.MyRoomState = MyRoomState;