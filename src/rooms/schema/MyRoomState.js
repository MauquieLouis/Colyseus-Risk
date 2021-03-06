const schema = require('@colyseus/schema');
const Player = require('./Player').Player
const Matrix = require('./Matrix').Matrix

class MyRoomState extends schema.Schema {

	constructor(){
		super();
		this.players = new schema.MapSchema();
		this.matrix = new Matrix();
	}
}
		
schema.defineTypes(MyRoomState,{
	players: {map: Player },
	matrix: Matrix,
})

exports.MyRoomState = MyRoomState;