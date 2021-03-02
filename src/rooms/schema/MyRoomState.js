const schema = require('@colyseus/schema');
const Player = require('C:\\Users\\Louis\\nodeTest\\my-colyseus-app\\src\\rooms\\schema\\Player').Player
const Matrix = require('C:\\Users\\Louis\\nodeTest\\my-colyseus-app\\src\\rooms\\schema\\Matrix').Matrix

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