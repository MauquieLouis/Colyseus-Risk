const schema = require('@colyseus/schema');
const Schema = schema.Schema;

class Territoire extends Schema{
	constructor(nom,continent,proprietaire){
		super();
		this.nom = nom;
		this.proprietaire = proprietaire;
		this.continent = continent;
	}
}
schema.defineTypes(Territoire, {
	nom: "string",
	proprietaire: "string",
	continent:"string",
});
	
exports.Territoire = Territoire