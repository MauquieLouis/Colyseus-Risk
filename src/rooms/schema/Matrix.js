const schema = require('@colyseus/schema');
const Schema = schema.Schema;


class Matrix extends Schema{
	constructor(){
		super();
		this.line = 8;
		this.column = 8;
		this.matrix = new Array(this.line).fill('#FFFFFF').map(() => new Array(this.line).fill('#FFFFFF'));
	}
}
schema.defineTypes(Matrix, {
	line: "number",
	column: "number",
});

exports.Matrix = Matrix

/*class MatrixState extends Schema{
	constructor(){
		super();
		this.matrix = new Matrix();
	}
	
}
schema.defineTypes(MatrixState,{
	Matrix: exports.Matrix
})

exports.MatrixState = MatrixState*/